<?php

namespace Tests\Unit;

use App\Models\Job;
use App\Models\JobApplication;
use App\Models\User;
use App\Services\JobApplicationService;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class JobApplicationServiceTest extends TestCase
{
    use RefreshDatabase;

    private JobApplicationService $service;

    private string $disk;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(JobApplicationService::class);
        $this->disk = config('filesystems.default');

        Storage::fake($this->disk);
    }

    public function test_store_creates_application_and_saves_cv(): void
    {
        $user = User::factory()->create([
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $job = Job::factory()->create();

        $cv = UploadedFile::fake()->create(
            'resume.pdf',
            100,
            'application/pdf'
        );

        $application = $this->service->store(
            $job,
            (int) $user->id,
            [
                'full_name' => 'Test Applicant',
                'email' => 'applicant@example.test',
                'phone' => '08123456789',
                'cv' => $cv,
                'cover_letter' => 'Saya tertarik dengan posisi ini.',
                'portfolio_url' => 'https://example.test/portfolio',
            ]
        );

        $this->assertInstanceOf(JobApplication::class, $application);
        $this->assertSame($job->id, $application->job_id);
        $this->assertSame($user->id, $application->user_id);
        $this->assertSame('Test Applicant', $application->full_name);
        $this->assertSame('applicant@example.test', $application->email);
        $this->assertSame('pending', $application->status);
        $this->assertNotEmpty($application->cv_path);

        $this->assertTrue(
            Storage::disk($this->disk)->exists($application->cv_path)
        );

        $this->assertDatabaseHas('job_applications', [
            'id' => $application->id,
            'job_id' => $job->id,
            'user_id' => $user->id,
            'full_name' => 'Test Applicant',
            'status' => 'pending',
            'cv_path' => $application->cv_path,
        ]);
    }

    public function test_store_deletes_cv_when_database_insert_fails(): void
    {
        $job = Job::factory()->create();

        $cv = UploadedFile::fake()->create(
            'resume.pdf',
            100,
            'application/pdf'
        );

        try {
            $this->service->store(
                $job,
                999999999,
                [
                    'full_name' => 'Test Applicant',
                    'email' => 'applicant@example.test',
                    'phone' => null,
                    'cv' => $cv,
                    'cover_letter' => null,
                    'portfolio_url' => null,
                ]
            );

            $this->fail(
                'Expected database insertion to fail for an unknown user.'
            );
        } catch (QueryException $exception) {
            $this->assertDatabaseCount('job_applications', 0);
        }

        $files = Storage::disk($this->disk)->allFiles('applications/cv');

        $this->assertSame(
            [],
            $files,
            'The uploaded CV should be deleted after a database failure.'
        );
    }
}
