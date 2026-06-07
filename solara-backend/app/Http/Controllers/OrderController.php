<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;

class OrderController extends Controller
{
    // Admin + Staff: all orders
    public function index()
    {
        return response()->json(
            Order::with(['orderItems.menuItem', 'user'])
                 ->latest()
                 ->get()
        );
    }

    // Customer: their own orders only
    public function myOrders(Request $request)
    {
        return response()->json(
            Order::with(['orderItems.menuItem'])
                 ->where('user_id', $request->user()->id)
                 ->latest()
                 ->get()
        );
    }

    // Staff + Customer: create order
    public function store(Request $request)
    {
        $request->validate([
            'items'                 => 'required|array|min:1',
            'items.*.menu_item_id'  => 'required|exists:menu_items,id',
            'items.*.quantity'      => 'required|integer|min:1',
            'payment_method'        => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            // Generate order number
            $orderNumber = 'ORD-' . str_pad(Order::count() + 1, 4, '0', STR_PAD_LEFT);

            // Calculate total
            $total = 0;
            foreach ($request->items as $item) {
                $menuItem = MenuItem::findOrFail($item['menu_item_id']);
                $total   += $menuItem->price * $item['quantity'];
            }

            // Create order
            $order = Order::create([
                'user_id'        => $request->user()->id,
                'order_number'   => $orderNumber,
                'status'         => 'pending',
                'total_amount'   => $total,
                'payment_method' => $request->payment_method,
            ]);

            // Create order items + deduct stock
            foreach ($request->items as $item) {
                $menuItem = MenuItem::findOrFail($item['menu_item_id']);

                OrderItem::create([
                    'order_id'     => $order->id,
                    'menu_item_id' => $item['menu_item_id'],
                    'quantity'     => $item['quantity'],
                    'unit_price'   => $menuItem->price,
                    'subtotal'     => $menuItem->price * $item['quantity'],
                ]);

                // Deduct stock
                $menuItem->decrement('stock_quantity', $item['quantity']);
            }

            DB::commit();
            return response()->json($order->load('orderItems.menuItem'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Order failed: ' . $e->getMessage()], 500);
        }
    }

    // Staff: update order status
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,preparing,ready,completed,cancelled'
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);
        return response()->json($order);
    }
}