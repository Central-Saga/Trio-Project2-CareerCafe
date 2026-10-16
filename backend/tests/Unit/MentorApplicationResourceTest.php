<?php

namespace Tests\Unit;

use App\Http\Resources\MentorApplicationResource;
use App\Models\MentorApplication;
use Illuminate\Http\Request;
use Tests\TestCase;

class MentorApplicationResourceTest extends TestCase
{
    public function test_resource_returns_application_fields_used_by_frontend(): void
    {
        $application = (new MentorApplication())->forceFill([
            'id' => 12,
            'user_id' => 5,
            'full_name' => 'Mentor Applicant',
            'job_title' => 'Software Engineer',
            'status' => 'rejected',
            'rejection_reason' => 'Documents need improvement.',
        ]);

        $data = (new MentorApplicationResource($application))->resolve(
            Request::create('/api/mentor-applications/my')
        );

        $this->assertSame(12, $data['id']);
        $this->assertSame(5, $data['user_id']);
        $this->assertSame('rejected', $data['status']);
        $this->assertSame(
            'Documents need improvement.',
            $data['rejection_reason']
        );
    }
}
