<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Membuat 10 pengguna (bawaan Laravel, boleh dibiarkan)
        User::factory(10)->create();

        User::factory()->create([
            'name' => 'Trio Riawan',
            'email' => 'trioriawan@example.com', // Sesuai dengan email yang ingin Anda pakai
            'password' => bcrypt('password123'),
        ]);
    }
}