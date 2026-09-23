<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed data utama Career Cafe.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | INDUSTRIES
        |--------------------------------------------------------------------------
        */

        $industries = [
            [
                'name' => 'Technology',
                'description' => 'Teknologi informasi, software development, dan engineering.',
            ],
            [
                'name' => 'Design',
                'description' => 'UI/UX design, product design, dan visual design.',
            ],
            [
                'name' => 'Product Management',
                'description' => 'Product strategy, product development, dan agile management.',
            ],
            [
                'name' => 'Digital Marketing',
                'description' => 'SEO, social media, content marketing, dan branding.',
            ],
        ];

        $industryIds = [];

        foreach ($industries as $industry) {
            $existingIndustry = DB::table('industries')
                ->where('name', $industry['name'])
                ->first();

            if ($existingIndustry) {
                DB::table('industries')
                    ->where('id', $existingIndustry->id)
                    ->update([
                        'description' => $industry['description'],
                        'updated_at' => now(),
                    ]);

                $industryIds[$industry['name']] = $existingIndustry->id;
            } else {
                $id = DB::table('industries')->insertGetId([
                    'name' => $industry['name'],
                    'description' => $industry['description'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $industryIds[$industry['name']] = $id;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | SKILLS
        |--------------------------------------------------------------------------
        */

        $skills = [
            'Laravel',
            'Next.js',
            'PostgreSQL',
            'Docker',
            'Figma',
            'User Research',
            'Design Systems',
            'Prototyping',
            'Product Strategy',
            'Agile',
            'Business Canvas',
            'Scrum',
            'Social Media',
            'SEO',
            'Content Marketing',
            'Branding',
        ];

        $skillIds = [];

        foreach ($skills as $skillName) {
            $existingSkill = DB::table('skills')
                ->where('name', $skillName)
                ->first();

            if ($existingSkill) {
                $skillIds[$skillName] = $existingSkill->id;
            } else {
                $id = DB::table('skills')->insertGetId([
                    'name' => $skillName,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $skillIds[$skillName] = $id;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | MENTORS
        |--------------------------------------------------------------------------
        */

        $mentors = [
            [
                'name' => 'Rian Pratama, S.Kom.',
                'email' => 'rian.pratama@careercafe.test',
                'job_title' => 'Senior Fullstack Engineer',
                'company' => 'TechBali Denpasar',
                'industry' => 'Technology',
                'location' => 'Denpasar, Bali',
                'experience_years' => 6,
                'education' => 'S1 Teknik Informatika',
                'linkedin_url' => 'https://www.linkedin.com/',
                'timezone' => 'Asia/Makassar',
                'avg_rating' => 4.90,
                'total_reviews' => 120,
                'profile_photo' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                'bio' => 'Berpengalaman lebih dari 6 tahun dalam pengembangan aplikasi web skala besar menggunakan ekosistem Laravel dan Next.js. Siap membantu memahami arsitektur perangkat lunak, backend, frontend, database, dan praktik terbaik industri.',
                'skills' => [
                    'Laravel',
                    'Next.js',
                    'PostgreSQL',
                    'Docker',
                ],
            ],

            [
                'name' => 'Putu Ayu Lestari',
                'email' => 'putu.ayu@careercafe.test',
                'job_title' => 'Lead UI/UX Designer',
                'company' => 'KriyaBali Digital',
                'industry' => 'Design',
                'location' => 'Denpasar, Bali',
                'experience_years' => 7,
                'education' => 'S1 Desain Komunikasi Visual',
                'linkedin_url' => 'https://www.linkedin.com/',
                'timezone' => 'Asia/Makassar',
                'avg_rating' => 5.00,
                'total_reviews' => 95,
                'profile_photo' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
                'bio' => 'Fokus pada pembuatan antarmuka pengguna yang intuitif dan berpusat pada pengguna. Berpengalaman mendesain produk digital untuk berbagai startup lokal maupun internasional.',
                'skills' => [
                    'Figma',
                    'User Research',
                    'Design Systems',
                    'Prototyping',
                ],
            ],

            [
                'name' => 'Gede Hendra Kusuma',
                'email' => 'gede.hendra@careercafe.test',
                'job_title' => 'Product Manager & Mentor',
                'company' => 'Career Cafe Corp',
                'industry' => 'Product Management',
                'location' => 'Badung, Bali',
                'experience_years' => 8,
                'education' => 'S1 Manajemen Bisnis',
                'linkedin_url' => 'https://www.linkedin.com/',
                'timezone' => 'Asia/Makassar',
                'avg_rating' => 4.80,
                'total_reviews' => 110,
                'profile_photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
                'bio' => 'Membantu mengarahkan visi produk dari tahap konseptual hingga peluncuran pasar. Ahli dalam penyusunan Business Model Canvas, validasi pasar, manajemen proyek, dan metodologi Agile.',
                'skills' => [
                    'Product Strategy',
                    'Agile',
                    'Business Canvas',
                    'Scrum',
                ],
            ],

            [
                'name' => 'Komang Sinta Dewi',
                'email' => 'komang.sinta@careercafe.test',
                'job_title' => 'Digital Marketing Specialist',
                'company' => 'Bali Creative Hub',
                'industry' => 'Digital Marketing',
                'location' => 'Gianyar, Bali',
                'experience_years' => 5,
                'education' => 'S1 Ilmu Komunikasi',
                'linkedin_url' => 'https://www.linkedin.com/',
                'timezone' => 'Asia/Makassar',
                'avg_rating' => 4.90,
                'total_reviews' => 88,
                'profile_photo' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
                'bio' => 'Praktisi pemasaran digital yang berfokus pada strategi pertumbuhan merek, manajemen media sosial, optimalisasi SEO, dan content marketing untuk meningkatkan visibilitas bisnis.',
                'skills' => [
                    'Social Media',
                    'SEO',
                    'Content Marketing',
                    'Branding',
                ],
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | CREATE / UPDATE MENTORS
        |--------------------------------------------------------------------------
        */

        foreach ($mentors as $mentorData) {
            $mentor = User::updateOrCreate(
                [
                    'email' => $mentorData['email'],
                ],
                [
                    'name' => $mentorData['name'],
                    'password' => Hash::make('password123'),
                    'role' => 'mentor',
                    'status' => 'active',
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | PROFILE
            |--------------------------------------------------------------------------
            */

            DB::table('profiles')->updateOrInsert(
                [
                    'user_id' => $mentor->id,
                ],
                [
                    'industry_id' => $industryIds[$mentorData['industry']],
                    'profile_photo' => $mentorData['profile_photo'],
                    'bio' => $mentorData['bio'],
                    'location' => $mentorData['location'],
                    'job_title' => $mentorData['job_title'],
                    'company' => $mentorData['company'],
                    'experience_years' => $mentorData['experience_years'],
                    'education' => $mentorData['education'],
                    'linkedin_url' => $mentorData['linkedin_url'],
                    'timezone' => $mentorData['timezone'],
                    'avg_rating' => $mentorData['avg_rating'],
                    'total_reviews' => $mentorData['total_reviews'],
                    'updated_at' => now(),
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | MENTOR SKILLS
            |--------------------------------------------------------------------------
            */

            foreach ($mentorData['skills'] as $skillName) {
                $skillId = $skillIds[$skillName];

                DB::table('mentor_skills')->updateOrInsert(
                    [
                        'user_id' => $mentor->id,
                        'skill_id' => $skillId,
                    ],
                    [
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | DEFAULT MENTEE FOR TESTING
        |--------------------------------------------------------------------------
        */

        User::updateOrCreate(
            [
                'email' => 'trioriawan@example.com',
            ],
            [
                'name' => 'Trio Riawan',
                'password' => Hash::make('password123'),
                'role' => 'mentee',
                'status' => 'active',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | MESSAGE
        |--------------------------------------------------------------------------
        */

        $this->command?->info('==========================================');
        $this->command?->info('Career Cafe database berhasil di-seed.');
        $this->command?->info('4 mentor berhasil dibuat/diperbarui.');
        $this->command?->info('1 akun mentee testing berhasil dibuat/diperbarui.');
        $this->command?->info('Password testing: password123');
        $this->command?->info('==========================================');
    }
}