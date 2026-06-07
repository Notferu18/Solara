<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use App\Models\MenuItem;

class ForecastController extends Controller
{
    public function getForecast()
    {
        $items   = MenuItem::with('category')->get();
        $results = [];

        foreach ($items as $item) {
            $salesData = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('order_items.menu_item_id', $item->id)
                ->where('orders.status', 'completed')
                ->selectRaw('DAYOFWEEK(orders.created_at) as day_of_week,
                             MONTH(orders.created_at) as month,
                             SUM(order_items.quantity) as total_sold')
                ->groupByRaw('DAYOFWEEK(orders.created_at), MONTH(orders.created_at)')
                ->get();

            $avgSales = $salesData->avg('total_sold') ?? 0;

            try {
                $response = Http::timeout(5)->post('http://localhost:5001/predict', [
                    'category_id' => $item->category_id,
                    'price'       => (float) $item->price,
                    'avg_sales'   => round($avgSales, 2),
                    'day_of_week' => now()->dayOfWeek,
                    'month'       => now()->month,
                ]);

                $prediction = $response->json();
            } catch (\Exception $e) {
                $prediction = ['predicted_quantity' => 0, 'confidence' => 'N/A'];
            }

            $results[] = [
                'id'                 => $item->id,
                'name'               => $item->name,
                'category'           => $item->category->name ?? 'N/A',
                'price'              => $item->price,
                'avg_sales'          => round($avgSales, 2),
                'predicted_quantity' => $prediction['predicted_quantity'] ?? 0,
            ];
        }

        return response()->json($results);
    }
}