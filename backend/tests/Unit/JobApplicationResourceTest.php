<?php

namespace Tests\Unit;

use App\Http\Resources\JobApplicationResource;
use App\Models\Job;
use App\Models\JobApplication;
use Illuminate\Http\Request;
use Tests\TestCase;

class JobApplicationResourceTest extends TestCase
{
    public function test_resource_returns_application_fields_and_job_details(): void
    {
        $job = new Job();
        $job->forceFill([
            'id' => 5,
            'title' => 'Backend Developer',
            'company' => 'Career Cafe',
            'location' => 'Bandung',
            'type' => 'Full-time',
            'category' => 'Technology',
            'salary' => 'Rp 8.000.000',
        ]);

        $application = new JobApplication();
        $application->forceFill([
            'id' => 10,
            'job_id' => 5,
            'user_id' => 20,
            'full_name' => 'Test Applicant',
            'email' => 'applicant@example.test',
            'phone' => null,
            'cv_path' => 'applications/cv/test.pdf',
            'cover_letter' => 'I am interested in this role.',
            'portfolio_url' => 'https://example.test/portfolio',
            'status' => 'pending',
            'applied_at' => '2026-10-16 08:00:00',
            'created_at' => '2026-10-16 08:00:00',
            'updated_at' => '2026-10-16 08:00:00',
        ]);
        $application->setRelation('job', $job);

        $data = (new JobApplicationResource($application))
            ->resolve(Request::create('/api/applications'));

        $this->assertSame(10, $data['id']);
        $this->assertSame(5, $data['job_id']);
        $this->assertSame(20, $data['user_id']);
        $this->assertSame('Test Applicant', $data['full_name']);
        $this->assertSame('applications/cv/test.pdf', $data['cv_path']);
        $this->assertSame('pending', $data['status']);
        $this->assertSame('Backend Developer', $data['job']['title']);
        $this->assertSame('Career Cafe', $data['job']['company']);
        $this->assertSame('Bandung', $data['job']['location']);
    }

    public function test_resource_returns_null_job_when_relation_is_not_loaded(): void
    {
        $application = new JobApplication();
        $application->forceFill([
            'id' => 11,
            'job_id' => 6,
            'user_id' => 21,
            'full_name' => 'Another Applicant',
            'email' => 'another@example.test',
            'status' => 'pending',
        ]);

        $data = (new JobApplicationResource($application))
            ->resolve(Request::create('/api/applications'));

        $this->assertSame(11, $data['id']);
        $this->assertArrayHasKey('job', $data);
        $this->assertNull($data['job']);
    }
}
