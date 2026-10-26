<?php

namespace Database\Seeders;

use App\Models\Job;
use Illuminate\Database\Seeder;

class JobSeeder extends Seeder
{
    public function run(): void
    {
        $jobs = [
            [
                'title' => 'Fullstack Developer',
                'company' => 'TechBali',
                'location' => 'Denpasar, Bali',
                'type' => 'Full Time',
                'category' => 'Technology',
                'skills' => ['Laravel', 'Next.js', 'PostgreSQL'],
                'description' => 'Build and maintain modern web applications.',
                'salary' => 'Rp 6jt - 9jt',
            ],
            [
                'title' => 'UI/UX Designer',
                'company' => 'KriyaBali Digital',
                'location' => 'Denpasar, Bali',
                'type' => 'Full Time',
                'category' => 'Design',
                'skills' => ['Figma', 'UI Design', 'UX Research'],
                'description' => 'Design clear, accessible digital experiences.',
                'salary' => 'Rp 5jt - 7jt',
            ],
            [
                'title' => 'Product Manager',
                'company' => 'Career Cafe Corp',
                'location' => 'Bali / Remote',
                'type' => 'Hybrid',
                'category' => 'Product',
                'skills' => ['Product Strategy', 'Agile', 'Business Canvas'],
                'description' => 'Guide product discovery and delivery.',
                'salary' => 'Rp 8jt - 12jt',
            ],
            [
                'title' => 'Digital Marketing Specialist',
                'company' => 'Bali Creative Hub',
                'location' => 'Gianyar, Bali',
                'type' => 'Full Time',
                'category' => 'Marketing',
                'skills' => ['SEO', 'Social Media', 'Content Marketing'],
                'description' => 'Plan and improve digital marketing campaigns.',
                'salary' => 'Rp 5jt - 8jt',
            ],
            [
                'title' => 'Frontend Developer',
                'company' => 'Nusa Digital',
                'location' => 'Remote',
                'type' => 'Remote',
                'category' => 'Technology',
                'skills' => ['React', 'Next.js', 'TypeScript'],
                'description' => 'Create responsive and accessible web interfaces.',
                'salary' => 'Rp 7jt - 10jt',
            ],
            [
                'title' => 'Graphic Designer',
                'company' => 'Island Creative',
                'location' => 'Badung, Bali',
                'type' => 'Part Time',
                'category' => 'Design',
                'skills' => ['Illustrator', 'Photoshop', 'Branding'],
                'description' => 'Create visual assets for digital brands.',
                'salary' => 'Rp 3jt - 5jt',
            ],
            [
                'title' => 'Backend Developer Intern',
                'company' => 'StartUp Bali',
                'location' => 'Denpasar, Bali',
                'type' => 'Internship',
                'category' => 'Technology',
                'skills' => ['PHP', 'Laravel', 'Git'],
                'description' => 'Support backend API and application development.',
                'salary' => 'Rp 1,5jt - 2,5jt',
            ],
            [
                'title' => 'Social Media Specialist',
                'company' => 'Bali Lifestyle Co.',
                'location' => 'Badung, Bali',
                'type' => 'Full Time',
                'category' => 'Marketing',
                'skills' => ['Instagram', 'TikTok', 'Analytics'],
                'description' => 'Plan social media content and engagement.',
                'salary' => 'Rp 4jt - 6jt',
            ],
        ];

        foreach ($jobs as $index => $job) {
            Job::query()->updateOrCreate(
                [
                    'title' => $job['title'],
                    'company' => $job['company'],
                ],
                [
                    ...$job,
                    'posted_at' => now()->subDays($index + 1),
                    'is_active' => true,
                ],
            );
        }
    }
}
