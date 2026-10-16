<?php

namespace Tests\Unit;

use App\Http\Resources\SessionResource;
use App\Models\Session;
use Illuminate\Http\Request;
use Tests\TestCase;

class SessionResourceTest extends TestCase
{
    public function test_resource_returns_session_fields_used_by_frontend(): void
    {
        $session = (new Session())->forceFill([
            'id' => 7,
            'mentor_id' => 2,
            'mentee_id' => 3,
            'booked_slot_id' => 9,
            'topic' => 'Career consultation',
            'status' => 'rejected',
            'rejection_reason' => 'Please reschedule.',
        ]);

        $data = (new SessionResource($session))->resolve(
            Request::create('/api/sessions/7')
        );

        $this->assertSame(7, $data['id']);
        $this->assertSame('rejected', $data['status']);
        $this->assertSame('Please reschedule.', $data['rejection_reason']);
        $this->assertSame(2, $data['mentor_id']);
    }
}
