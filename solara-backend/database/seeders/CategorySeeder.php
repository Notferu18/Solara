<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Coffee',
            'Non-Coffee & Tea',
            'Meals',
            'Snacks',
        ];

        foreach ($categories as $name) {
            Category::create(['name' => $name]);
        }
    }
}