<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Admin Solara',
            'email'    => 'admin@solara.com',
            'password' => Hash::make('123'),
            'role'     => 'admin',
        ]);

        User::create([
            'name'     => 'Staff One',
            'email'    => 'staff@solara.com',
            'password' => Hash::make('123'),
            'role'     => 'staff',
        ]);

        User::create([
            'name'     => 'Shayne Anne Silagan',
            'email'    => 'customer@solara.com',
            'password' => Hash::make('123'),
            'role'     => 'customer',
        ]);

        User::create([
            'name'     => 'Lipra Qriz Abyan',
            'email'    => 'lipra@solara.com',
            'password' => Hash::make('123'),
            'role'     => 'customer',
        ]);
    }
}