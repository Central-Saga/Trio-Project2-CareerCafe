<?php

namespace Tests\Unit;

use App\Models\Industry;
use App\Models\MentorApplication;
use App\Models\User;
use App\Services\MentorApplicationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class MentorApplicationServiceTest extends TestCase
{
    use RefreshDatabase;

    private MentorApplicationService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(MentorApplicationService::class);
    }

    public function test_approve_changes_application_and_user_to_mentor(): void
    {
        $user = User::factory()->create([
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $reviewer = User::factory()->create([
            'role' => 'admin',
            'status' => 'active',
        ]);

        $industry = Industry::query()->create([
            'name' => 'Technology',
        ]);

        $application = $this->makeMentorApplication(
            $user,
            $industry->id
        );

        $approved = $this->service->approve(
            $application->id,
            $reviewer->id
        );

        $this->assertSame('approved', $approved->status);
        $this->assertEquals($reviewer->id, $approved->reviewed_by);
        $this->assertNotNull($approved->reviewed_at);
        $this->assertNull($approved->rejection_reason);

        $user->refresh();

        $this->assertSame('mentor', $user->role);
        $this->assertSame('active', $user->status);
        $this->assertSame($application->full_name, $user->name);

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'industry_id' => $industry->id,
            'job_title' => 'Software Engineer',
        ]);
    }

    public function test_reject_saves_reason_and_reviewer(): void
    {
        $user = User::factory()->create([
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $reviewer = User::factory()->create([
            'role' => 'admin',
            'status' => 'active',
        ]);

        $application = $this->makeMentorApplication($user);

        $rejected = $this->service->reject(
            $application->id,
            $reviewer->id,
            'Dokumen belum lengkap.'
        );

        $this->assertSame('rejected', $rejected->status);
        $this->assertEquals($reviewer->id, $rejected->reviewed_by);
        $this->assertSame(
            'Dokumen belum lengkap.',
            $rejected->rejection_reason
        );
        $this->assertNotNull($rejected->reviewed_at);

        $user->refresh();

        $this->assertSame('mentee', $user->role);
    }

    public function test_approve_throws_404_when_application_does_not_exist(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionCode(404);

        $this->service->approve(999999, 1);
    }

    public function test_reject_throws_404_when_application_does_not_exist(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionCode(404);

        $this->service->reject(
            999999,
            1,
            'Dokumen belum lengkap.'
        );
    }

    public function test_approved_application_cannot_be_approved_again(): void
    {
        $user = User::factory()->create([
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $reviewer = User::factory()->create([
            'role' => 'admin',
            'status' => 'active',
        ]);

        $application = $this->makeMentorApplication(
            $user,
            null,
            ['status' => 'approved']
        );

        try {
            $this->service->approve(
                $application->id,
                $reviewer->id
            );

            $this->fail('Expected a RuntimeException.');
        } catch (RuntimeException $exception) {
            $this->assertSame(422, $exception->getCode());
        }
    }

    public function test_rejected_application_cannot_be_rejected_again(): void
    {
        $user = User::factory()->create([
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $reviewer = User::factory()->create([
            'role' => 'admin',
            'status' => 'active',
        ]);

        $application = $this->makeMentorApplication(
            $user,
            null,
            ['status' => 'rejected']
        );

        try {
            $this->service->reject(
                $application->id,
                $reviewer->id,
                'Dokumen belum lengkap.'
            );

            $this->fail('Expected a RuntimeException.');
        } catch (RuntimeException $exception) {
            $this->assertSame(422, $exception->getCode());
        }
    }

    private function makeMentorApplication(
        User $user,
        ?int $industryId = null,
        array $overrides = []
    ): MentorApplication {
        return MentorApplication::query()->create(array_merge([
            'user_id' => $user->id,
            'full_name' => 'Test Mentor',
            'job_title' => 'Software Engineer',
            'company' => 'Example Company',
            'location' => 'Denpasar',
            'experience_years' => 5,
            'education' => 'Bachelor Degree',
            'industry_id' => $industryId,
            'bio' => 'Experienced software engineer.',
            'motivation' => 'I want to help other developers.',
            'linkedin_url' => 'https://www.linkedin.com/in/test-mentor',
            'skills' => [],
            'status' => 'pending',
            'reviewed_by' => null,
            'rejection_reason' => null,
            'reviewed_at' => null,
        ], $overrides));
    }
}
