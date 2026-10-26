<?php

namespace Database\Seeders;

use App\Models\Availability;
use App\Models\BookedSlot;
use App\Models\Feedback;
use App\Models\Industry;
use App\Models\Job;
use App\Models\JobApplication;
use App\Models\MentorApplication;
use App\Models\MentorApplicationDocument;
use App\Models\Post;
use App\Models\Profile;
use App\Models\Session;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $industries = [
            'Technology' => 'Software development and information technology.',
            'Design' => 'Product, user experience, and visual design.',
            'Product Management' => 'Product strategy and agile development.',
            'Digital Marketing' => 'SEO, social media, and content marketing.',
        ];

        $industryIds = [];

        foreach ($industries as $name => $description) {
            $industryIds[$name] = Industry::query()->updateOrCreate(
                ['name' => $name],
                ['description' => $description],
            )->id;
        }

        $skillNames = [
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
            'React',
            'TypeScript',
            'Git',
            'Illustrator',
            'Photoshop',
            'Instagram',
            'TikTok',
            'Analytics',
            'PHP',
            'UI Design',
            'UX Research',
            'Content',
        ];

        $skillIds = [];

        foreach ($skillNames as $name) {
            $skillIds[$name] = Skill::query()->updateOrCreate(
                ['name' => $name],
            )->id;
        }

        User::query()->updateOrCreate(
            ['email' => 'admin@careercafe.test'],
            [
                'name' => 'Career Cafe Admin',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'status' => 'active',
            ],
        );

        $mentors = [
            [
                'name' => 'Rian Pratama',
                'email' => 'rian.pratama@careercafe.test',
                'job_title' => 'Senior Fullstack Engineer',
                'company' => 'TechBali',
                'industry' => 'Technology',
                'location' => 'Denpasar, Bali',
                'experience_years' => 6,
                'education' => 'S1 Teknik Informatika',
                'bio' => 'Software engineer sharing practical web development experience.',
                'skills' => ['Laravel', 'Next.js', 'PostgreSQL', 'Docker'],
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
                'bio' => 'Product designer focused on accessible, user-centered experiences.',
                'skills' => ['Figma', 'User Research', 'Design Systems', 'Prototyping'],
            ],
            [
                'name' => 'Gede Hendra Kusuma',
                'email' => 'gede.hendra@careercafe.test',
                'job_title' => 'Product Manager',
                'company' => 'Career Cafe Corp',
                'industry' => 'Product Management',
                'location' => 'Badung, Bali',
                'experience_years' => 8,
                'education' => 'S1 Manajemen Bisnis',
                'bio' => 'Product manager experienced in strategy, discovery, and agile delivery.',
                'skills' => ['Product Strategy', 'Agile', 'Business Canvas', 'Scrum'],
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
                'bio' => 'Digital marketer focused on content, search, and brand growth.',
                'skills' => ['Social Media', 'SEO', 'Content Marketing', 'Branding'],
            ],
        ];

        $mentorUsers = [];

        foreach ($mentors as $mentorData) {
            $mentor = User::query()->updateOrCreate(
                ['email' => $mentorData['email']],
                [
                    'name' => $mentorData['name'],
                    'password' => Hash::make('password123'),
                    'role' => 'mentor',
                    'status' => 'active',
                ],
            );
            $mentorUsers[$mentorData['email']] = $mentor;

            Profile::query()->updateOrCreate(
                ['user_id' => $mentor->id],
                [
                    'industry_id' => $industryIds[$mentorData['industry']],
                    'bio' => $mentorData['bio'],
                    'location' => $mentorData['location'],
                    'job_title' => $mentorData['job_title'],
                    'company' => $mentorData['company'],
                    'experience_years' => $mentorData['experience_years'],
                    'education' => $mentorData['education'],
                    'linkedin_url' => 'https://example.test/mentors/'.$mentor->id,
                    'timezone' => 'Asia/Makassar',
                    'avg_rating' => 0,
                    'total_reviews' => 0,
                ],
            );

            $mentor->skills()->syncWithoutDetaching(
                array_map(
                    fn (string $skill): int => $skillIds[$skill],
                    $mentorData['skills'],
                ),
            );
        }

        $mentee = User::query()->updateOrCreate(
            ['email' => 'trioriawan@example.com'],
            [
                'name' => 'Trio Riawan',
                'password' => Hash::make('password123'),
                'role' => 'mentee',
                'status' => 'active',
            ],
        );
        $mentorApplicant = User::query()->updateOrCreate(
            ['email' => 'mentee@careercafe.test'],
            [
                'name' => 'Demo Mentor Applicant',
                'password' => Hash::make('password123'),
                'role' => 'mentee',
                'status' => 'active',
            ],
        );

        foreach ([$mentee, $mentorApplicant] as $user) {
            Profile::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'industry_id' => $industryIds['Technology'],
                    'bio' => 'Demo Career Cafe community member.',
                    'location' => 'Denpasar, Bali',
                    'job_title' => 'Software Developer',
                    'company' => 'Example Studio',
                    'experience_years' => 2,
                    'education' => 'Bachelor Degree',
                    'timezone' => 'Asia/Jakarta',
                ],
            );
        }

        $this->call([
            JobSeeder::class,
            MentorAvailabilitySeeder::class,
        ]);

        $fullstackJob = Job::query()
            ->where('title', 'Fullstack Developer')
            ->where('company', 'TechBali')
            ->firstOrFail();

        JobApplication::query()->updateOrCreate(
            [
                'job_id' => $fullstackJob->id,
                'user_id' => $mentee->id,
            ],
            [
                'full_name' => $mentee->name,
                'email' => $mentee->email,
                'phone' => null,
                'cv_path' => null,
                'cover_letter' => 'I am interested in this demo role.',
                'portfolio_url' => 'https://example.test/portfolio',
                'status' => 'pending',
                'applied_at' => now(),
            ],
        );

        foreach ([
            [
                'user' => $mentorUsers['rian.pratama@careercafe.test'],
                'title' => 'Building reliable Laravel applications',
                'category' => 'Industry Insight',
                'content' => 'A practical demo post about maintainable web applications.',
            ],
            [
                'user' => $mentorUsers['putu.ayu@careercafe.test'],
                'title' => 'Starting with user research',
                'category' => 'Interview Tips',
                'content' => 'A practical demo post about understanding user needs.',
            ],
        ] as $postData) {
            Post::query()->updateOrCreate(
                [
                    'user_id' => $postData['user']->id,
                    'title' => $postData['title'],
                ],
                [
                    'content' => $postData['content'],
                    'category' => $postData['category'],
                    'status' => 'published',
                ],
            );
        }

        $mentor = $mentorUsers['rian.pratama@careercafe.test'];
        $availability = Availability::query()
            ->where('mentor_id', $mentor->id)
            ->orderBy('day_of_week')
            ->firstOrFail();
        $slot = BookedSlot::query()->updateOrCreate(
            [
                'mentor_id' => $mentor->id,
                'date' => '2030-01-07',
                'start_time' => '10:00:00',
            ],
            [
                'end_time' => '10:45:00',
                'status' => 'booked',
                'availability_id' => $availability->id,
            ],
        );
        $session = Session::query()->updateOrCreate(
            ['booked_slot_id' => $slot->id],
            [
                'mentor_id' => $mentor->id,
                'mentee_id' => $mentee->id,
                'topic' => 'Career planning',
                'message' => 'Demo mentoring session.',
                'duration' => 45,
                'meeting_type' => 'online',
                'meeting_link' => 'https://meet.google.com',
                'meeting_location' => null,
                'status' => 'completed',
            ],
        );

        Feedback::query()->updateOrCreate(
            ['session_id' => $session->id],
            [
                'mentor_id' => $mentor->id,
                'mentee_id' => $mentee->id,
                'rating' => 5,
                'comment' => 'A helpful demo mentoring session.',
            ],
        );

        Profile::query()->where('user_id', $mentor->id)->update([
            'avg_rating' => 5,
            'total_reviews' => 1,
        ]);

        $application = MentorApplication::query()->updateOrCreate(
            ['user_id' => $mentorApplicant->id],
            [
                'full_name' => $mentorApplicant->name,
                'job_title' => 'Software Developer',
                'company' => 'Example Studio',
                'location' => 'Denpasar, Bali',
                'experience_years' => 5,
                'education' => 'Bachelor Degree',
                'industry_id' => $industryIds['Technology'],
                'bio' => 'Demo applicant with professional experience.',
                'motivation' => 'I would like to support the community.',
                'linkedin_url' => 'https://example.test/demo-mentor-applicant',
                'skills' => [$skillIds['Laravel'], $skillIds['PostgreSQL']],
                'status' => 'pending',
                'reviewed_by' => null,
                'reviewed_at' => null,
                'rejection_reason' => null,
            ],
        );

        MentorApplicationDocument::query()->updateOrCreate(
            [
                'mentor_application_id' => $application->id,
                'document_type' => 'certificate',
                'original_name' => 'demo-certificate.pdf',
            ],
            [
                'file_path' => 'mentor-applications/demo/certificate.pdf',
                'mime_type' => 'application/pdf',
                'file_size' => 1024,
            ],
        );

        $this->command?->info('Career Cafe demo data seeded or updated.');
        $this->command?->info('Demo accounts use the password: password123');
    }
}
