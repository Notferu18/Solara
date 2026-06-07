<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $period = $request->query('period', 'weekly');

        // Date range
        $startDate = match($period) {
            'daily'   => now()->startOfDay(),
            'monthly' => now()->startOfMonth(),
            default   => now()->startOfWeek(),
        };

        // Summary
        $orders = Order::where('status', 'completed')
                       ->where('created_at', '>=', $startDate);

        $totalRevenue   = $orders->sum('total_amount');
        $totalOrders    = $orders->count();
        $avgOrderValue  = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Chart data
        $groupFormat = match($period) {
            'daily'   => '%H:00',
            'monthly' => '%Y-%m-%d',
            default   => '%Y-%m-%d',
        };

        $chartData = Order::where('status', 'completed')
            ->where('created_at', '>=', $startDate)
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$groupFormat}') as label"),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->groupBy('label')
            ->orderBy('label')
            ->get();

        // Top items
        $topItems = DB::table('order_items')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'completed')
            ->where('orders.created_at', '>=', $startDate)
            ->select('menu_items.name', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->groupBy('menu_items.id', 'menu_items.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        return response()->json([
            'total_revenue'   => $totalRevenue,
            'total_orders'    => $totalOrders,
            'avg_order_value' => $avgOrderValue,
            'chart_data'      => $chartData,
            'top_items'       => $topItems,
        ]);
    }
}