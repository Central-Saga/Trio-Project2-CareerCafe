<?php

namespace Tests\Feature;

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
use App\Services\SessionService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ModelQualityTest extends TestCase
{
    use RefreshDatabase;

    public function test_transactional_models_use_soft_deletes(): void
    {
        foreach ([
            Session::class,
            JobApplication::class,
            MentorApplication::class,
            Post::class,
            Feedback::class,
        ] as $model) {
            $this->assertContains(
                SoftDeletes::class,
                class_uses_recursive($model),
            );
        }
    }

    public function test_soft_deleted_records_are_hidden_from_normal_queries(): void
    {
        $records = [
            Session::factory()->create(),
            JobApplication::factory()->create(),
            MentorApplication::factory()->create(),
            Post::factory()->create(),
            Feedback::factory()->create(),
        ];

        foreach ($records as $record) {
            $record->delete();

            $this->assertNull($record->newQuery()->find($record->getKey()));
            $this->assertNotNull(
                $record->newQuery()
                    ->withTrashed()
                    ->findOrFail($record->getKey())
                    ->deleted_at,
            );
        }
    }

    public function test_deleting_session_soft_deletes_feedback_in_one_service_operation(): void
    {
        $feedback = Feedback::factory()->create();
        $session = $feedback->session()->firstOrFail();

        app(SessionService::class)->delete($session);

        $this->assertNull(Session::query()->find($session->id));
        $this->assertNull(Feedback::query()->find($feedback->id));
        $this->assertNotNull(
            Session::withTrashed()->findOrFail($session->id)->deleted_at,
        );
        $this->assertNotNull(
            Feedback::withTrashed()->findOrFail($feedback->id)->deleted_at,
        );
        $this->assertDatabaseHas('mentoring_sessions', ['id' => $session->id]);
        $this->assertDatabaseHas('feedbacks', ['id' => $feedback->id]);
    }

    public function test_factories_create_all_thirteen_models_with_valid_relations(): void
    {
        $user = User::factory()->create();
        $mentor = User::factory()->create(['role' => 'mentor']);
        $industry = Industry::factory()->create();
        $skill = Skill::factory()->create();
        $job = Job::factory()->create();
        $profile = Profile::factory()->create([
            'user_id' => $user->id,
            'industry_id' => $industry->id,
        ]);
        $post = Post::factory()->create(['user_id' => $user->id]);
        $availability = Availability::factory()->create();
        $slot = BookedSlot::factory()->create([
            'mentor_id' => $availability->mentor_id,
            'availability_id' => $availability->id,
        ]);
        $session = Session::factory()->create([
            'mentor_id' => $availability->mentor_id,
            'booked_slot_id' => $slot->id,
        ]);
        $jobApplication = JobApplication::factory()->create([
            'job_id' => $job->id,
            'user_id' => $user->id,
        ]);
        $mentorApplication = MentorApplication::factory()->create([
            'user_id' => $user->id,
            'industry_id' => $industry->id,
        ]);
        $document = MentorApplicationDocument::factory()->create([
            'mentor_application_id' => $mentorApplication->id,
        ]);
        $feedback = Feedback::factory()->create([
            'session_id' => $session->id,
        ]);

        $this->assertSame($user->id, $profile->user_id);
        $this->assertSame($industry->id, $profile->industry_id);
        $this->assertSame($user->id, $post->user_id);
        $this->assertSame($job->id, $jobApplication->job_id);
        $this->assertSame($user->id, $jobApplication->user_id);
        $this->assertSame($availability->mentor_id, $slot->mentor_id);
        $this->assertSame($slot->id, $session->booked_slot_id);
        $this->assertSame($mentorApplication->id, $document->mentor_application_id);
        $this->assertSame($session->id, $feedback->session_id);
        $this->assertSame($session->mentor_id, $feedback->mentor_id);
        $this->assertSame($session->mentee_id, $feedback->mentee_id);
        $mentor->skills()->syncWithoutDetaching([$skill->id]);
        $this->assertDatabaseHas('mentor_skills', [
            'user_id' => $mentor->id,
            'skill_id' => $skill->id,
        ]);
    }

    public function test_database_seeder_is_idempotent_and_creates_related_demo_data(): void
    {
        $firstSeedExitCode = Artisan::call('db:seed', [
            '--class' => DatabaseSeeder::class,
            '--no-interaction' => true,
        ]);
        $this->assertSame(0, $firstSeedExitCode);

        $tables = [
            'users',
            'profiles',
            'industries',
            'skills',
            'mentor_skills',
            'jobs',
            'job_applications',
            'posts',
            'availabilities',
            'booked_slots',
            'mentoring_sessions',
            'feedbacks',
            'mentor_applications',
            'mentor_application_documents',
        ];
        $initialCounts = [];

        foreach ($tables as $table) {
            $initialCounts[$table] = DB::table($table)->count();
        }

        $secondSeedExitCode = Artisan::call('db:seed', [
            '--class' => DatabaseSeeder::class,
            '--no-interaction' => true,
        ]);
        $this->assertSame(0, $secondSeedExitCode);

        foreach ($tables as $table) {
            $this->assertSame(
                $initialCounts[$table],
                DB::table($table)->count(),
                "Repeated seeding duplicated rows in {$table}.",
            );
        }

        $mentor = User::query()
            ->where('email', 'rian.pratama@careercafe.test')
            ->firstOrFail();
        $mentee = User::query()
            ->where('email', 'trioriawan@example.com')
            ->firstOrFail();
        $job = Job::query()
            ->where('title', 'Fullstack Developer')
            ->firstOrFail();
        $session = Session::query()
            ->where('mentor_id', $mentor->id)
            ->where('mentee_id', $mentee->id)
            ->firstOrFail();

        $this->assertSame('mentor', $mentor->role);
        $this->assertSame('mentee', $mentee->role);
        $this->assertNotNull($mentor->profile);
        $this->assertNotNull($job->applications()->where('user_id', $mentee->id)->first());
        $this->assertGreaterThan(0, $mentor->skills()->count());
        $this->assertGreaterThan(0, $mentor->availabilities()->count());
        $this->assertNotNull($session->bookedSlot);
        $this->assertNotNull($session->feedback);
        $this->assertGreaterThan(0, $mentor->posts()->count());
        $mentorApplication = MentorApplication::query()
            ->whereHas('user', fn ($query) => $query->where(
                'email',
                'mentee@careercafe.test',
            ))
            ->firstOrFail();
        $this->assertDatabaseHas('mentor_application_documents', [
            'mentor_application_id' => $mentorApplication->id,
        ]);
    }
}
