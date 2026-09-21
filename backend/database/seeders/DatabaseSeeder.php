<?php
namespace Database\Seeders;
use App\Models\User;
use App\Models\Job; // Tambahkan pemanggilan model Job
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Membuat 10 pengguna (bawaan Laravel, boleh dibiarkan)
        User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Tambahkan baris ini untuk membuat 10 data lowongan pekerjaan
        Job::factory(10)->create(); 
    }
}
