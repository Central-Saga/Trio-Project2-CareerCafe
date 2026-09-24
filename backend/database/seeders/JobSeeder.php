<?php

namespace Database\Seeders;

use App\Models\Job;
use Illuminate\Database\Seeder;

class JobSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Job::create([
            'title' => 'Fullstack Developer',
            'company' => 'TechBali',
            'location' => 'Denpasar, Bali',
            'type' => 'Full Time',
            'category' => 'Technology',
            'skills' => [
                'Laravel',
                'Next.js',
                'PostgreSQL',
            ],
            'description' =>
                'Mengembangkan aplikasi web menggunakan teknologi frontend dan backend modern. Posisi ini cocok untuk developer yang memiliki pengalaman dalam membangun aplikasi web dan memahami arsitektur backend serta frontend.',
            'salary' => 'Rp 6jt - 9jt',
            'posted_at' => now()->subDays(2),
            'is_active' => true,
        ]);

        Job::create([
            'title' => 'UI/UX Designer',
            'company' => 'KriyaBali Digital',
            'location' => 'Denpasar, Bali',
            'type' => 'Full Time',
            'category' => 'Design',
            'skills' => [
                'Figma',
                'UI Design',
                'UX Research',
            ],
            'description' =>
                'Merancang pengalaman pengguna dan antarmuka digital yang mudah digunakan, menarik, dan sesuai dengan kebutuhan pengguna.',
            'salary' => 'Rp 5jt - 7jt',
            'posted_at' => now()->subDay(),
            'is_active' => true,
        ]);

        Job::create([
            'title' => 'Product Manager',
            'company' => 'Career Cafe Corp',
            'location' => 'Bali / Remote',
            'type' => 'Hybrid',
            'category' => 'Product',
            'skills' => [
                'Product Strategy',
                'Agile',
                'Business',
            ],
            'description' =>
                'Mengelola pengembangan produk digital dari tahap ide, riset pengguna, penyusunan strategi produk, hingga proses peluncuran.',
            'salary' => 'Rp 8jt - 12jt',
            'posted_at' => now()->subDays(3),
            'is_active' => true,
        ]);

        Job::create([
            'title' => 'Digital Marketing Specialist',
            'company' => 'Bali Creative Hub',
            'location' => 'Gianyar, Bali',
            'type' => 'Full Time',
            'category' => 'Marketing',
            'skills' => [
                'SEO',
                'Social Media',
                'Content',
            ],
            'description' =>
                'Menyusun strategi pemasaran digital dan meningkatkan visibilitas brand melalui berbagai kanal digital.',
            'salary' => 'Rp 5jt - 8jt',
            'posted_at' => now()->subDays(4),
            'is_active' => true,
        ]);

        Job::create([
            'title' => 'Frontend Developer',
            'company' => 'Nusa Digital',
            'location' => 'Remote',
            'type' => 'Remote',
            'category' => 'Technology',
            'skills' => [
                'React',
                'Next.js',
                'TypeScript',
            ],
            'description' =>
                'Mengembangkan interface web yang cepat, responsive, dan mudah digunakan.',
            'salary' => 'Rp 7jt - 10jt',
            'posted_at' => now()->subDays(5),
            'is_active' => true,
        ]);

        Job::create([
            'title' => 'Graphic Designer',
            'company' => 'Island Creative',
            'location' => 'Badung, Bali',
            'type' => 'Part Time',
            'category' => 'Design',
            'skills' => [
                'Illustrator',
                'Photoshop',
                'Branding',
            ],
            'description' =>
                'Membuat kebutuhan visual untuk branding, sosial media, dan kampanye digital.',
            'salary' => 'Rp 3jt - 5jt',
            'posted_at' => now()->subDays(6),
            'is_active' => true,
        ]);

        Job::create([
            'title' => 'Backend Developer Intern',
            'company' => 'StartUp Bali',
            'location' => 'Denpasar, Bali',
            'type' => 'Internship',
            'category' => 'Technology',
            'skills' => [
                'PHP',
                'Laravel',
                'Git',
            ],
            'description' =>
                'Membantu tim backend dalam mengembangkan API dan sistem backend untuk aplikasi digital.',
            'salary' => 'Rp 1,5jt - 2,5jt',
            'posted_at' => now()->subWeek(),
            'is_active' => true,
        ]);

        Job::create([
            'title' => 'Social Media Specialist',
            'company' => 'Bali Lifestyle Co.',
            'location' => 'Badung, Bali',
            'type' => 'Full Time',
            'category' => 'Marketing',
            'skills' => [
                'Instagram',
                'TikTok',
                'Analytics',
            ],
            'description' =>
                'Mengelola konten sosial media dan membantu meningkatkan engagement serta awareness brand.',
            'salary' => 'Rp 4jt - 6jt',
            'posted_at' => now()->subWeek(),
            'is_active' => true,
        ]);
    }
}