<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MenuItem;
use App\Models\Category;

class MenuItemSeeder extends Seeder
{
    public function run(): void
    {
        $coffee    = Category::where('name', 'Coffee')->first()->id;
        $nonCoffee = Category::where('name', 'Non-Coffee & Tea')->first()->id;
        $meals     = Category::where('name', 'Meals')->first()->id;
        $snacks    = Category::where('name', 'Snacks')->first()->id;

        $items = [
            // ── Coffee ───────────────────────────────────────
            ['category_id' => $coffee, 'name' => 'Cafe Latte',           'price' => 79,  'stock_quantity' => 100],
            ['category_id' => $coffee, 'name' => 'Spanish',              'price' => 89,  'stock_quantity' => 100],
            ['category_id' => $coffee, 'name' => 'Sea Salt Latte',       'price' => 89,  'stock_quantity' => 100],
            ['category_id' => $coffee, 'name' => 'Barista Signature',    'price' => 89,  'stock_quantity' => 100],
            ['category_id' => $coffee, 'name' => 'Salted Caramel Latte', 'price' => 99,  'stock_quantity' => 100],
            ['category_id' => $coffee, 'name' => 'Caffe Mocha',          'price' => 99,  'stock_quantity' => 100],
            ['category_id' => $coffee, 'name' => 'Caramel Macchiato',    'price' => 99,  'stock_quantity' => 100],
            ['category_id' => $coffee, 'name' => 'Matcha Latte',         'price' => 119, 'stock_quantity' => 100],
            ['category_id' => $coffee, 'name' => 'Strawberry Matcha',    'price' => 129, 'stock_quantity' => 100],

            // ── Non-Coffee & Tea ─────────────────────────────
            ['category_id' => $nonCoffee, 'name' => 'Lemon & Pomegranate', 'price' => 69, 'stock_quantity' => 100],
            ['category_id' => $nonCoffee, 'name' => 'Citron & Ginger',     'price' => 69, 'stock_quantity' => 100],
            ['category_id' => $nonCoffee, 'name' => 'Strawberry Milk',     'price' => 79, 'stock_quantity' => 100],
            ['category_id' => $nonCoffee, 'name' => 'Blueberry Milk',      'price' => 79, 'stock_quantity' => 100],
            ['category_id' => $nonCoffee, 'name' => 'Chocolate Milk',      'price' => 79, 'stock_quantity' => 100],

            // ── Meals ────────────────────────────────────────
            ['category_id' => $meals, 'name' => 'Kimchi Rice w/ Egg',          'price' => 99,  'stock_quantity' => 50],
            ['category_id' => $meals, 'name' => 'Pork Belly Kimchi Rice w/ Egg','price' => 149, 'stock_quantity' => 50],
            ['category_id' => $meals, 'name' => 'Beef Bibimbab w/ Egg',        'price' => 149, 'stock_quantity' => 50],
            ['category_id' => $meals, 'name' => '4pcs Chix Winglet',           'price' => 119, 'stock_quantity' => 50],
            ['category_id' => $meals, 'name' => '6pcs Chix Winglet',           'price' => 149, 'stock_quantity' => 50],
            ['category_id' => $meals, 'name' => 'Tocilog',                     'price' => 79,  'stock_quantity' => 50],
            ['category_id' => $meals, 'name' => 'Longsilog',                   'price' => 79,  'stock_quantity' => 50],
            ['category_id' => $meals, 'name' => 'Hotsilog',                    'price' => 79,  'stock_quantity' => 50],
            ['category_id' => $meals, 'name' => 'Tapsilog',                    'price' => 89,  'stock_quantity' => 50],
            ['category_id' => $meals, 'name' => 'Spamsilog',                   'price' => 89,  'stock_quantity' => 50],
            ['category_id' => $meals, 'name' => 'Baconsilog',                  'price' => 89,  'stock_quantity' => 50],

            // ── Snacks ───────────────────────────────────────
            ['category_id' => $snacks, 'name' => 'Seasoned Fries',          'price' => 69,  'stock_quantity' => 80],
            ['category_id' => $snacks, 'name' => 'Cheesy Beef Fries',       'price' => 109, 'stock_quantity' => 80],
            ['category_id' => $snacks, 'name' => 'Beefy Nacho Chips',       'price' => 109, 'stock_quantity' => 80],
            ['category_id' => $snacks, 'name' => 'Choco Chip Pancake',      'price' => 69,  'stock_quantity' => 80],
            ['category_id' => $snacks, 'name' => 'Quesadilla Beef & Tuna',  'price' => 119, 'stock_quantity' => 80],
            ['category_id' => $snacks, 'name' => 'Quesadilla Cheese',       'price' => 109, 'stock_quantity' => 80],
        ];

        foreach ($items as $item) {
            MenuItem::create([
                'category_id'    => $item['category_id'],
                'name'           => $item['name'],
                'price'          => $item['price'],
                'stock_quantity' => $item['stock_quantity'],
                'is_available'   => true,
                'description'    => null,
            ]);
        }
    }
}