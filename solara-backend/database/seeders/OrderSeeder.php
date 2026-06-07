<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\User;
use Carbon\Carbon;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::where('role', 'customer')->get();
        $menuItems = MenuItem::all();
        $statuses  = ['completed', 'completed', 'completed', 'cancelled'];
        $payments  = ['Cash', 'GCash'];

        for ($i = 1; $i <= 200; $i++) {
            $customer    = $customers->random();
            $orderItems  = $menuItems->random(rand(1, 4));
            $total       = 0;
            $orderNumber = 'ORD-' . str_pad($i, 4, '0', STR_PAD_LEFT);

            // Random date within last 30 days
            $date = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23));

            $order = Order::create([
                'user_id'        => $customer->id,
                'order_number'   => $orderNumber,
                'status'         => $statuses[array_rand($statuses)],
                'total_amount'   => 0, // update after
                'payment_method' => $payments[array_rand($payments)],
                'created_at'     => $date,
                'updated_at'     => $date,
            ]);

            foreach ($orderItems as $item) {
                $qty      = rand(1, 3);
                $subtotal = $item->price * $qty;
                $total   += $subtotal;

                OrderItem::create([
                    'order_id'     => $order->id,
                    'menu_item_id' => $item->id,
                    'quantity'     => $qty,
                    'unit_price'   => $item->price,
                    'subtotal'     => $subtotal,
                    'created_at'   => $date,
                    'updated_at'   => $date,
                ]);
            }

            $order->update(['total_amount' => $total]);
        }
    }
}