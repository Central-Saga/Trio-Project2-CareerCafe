<?php

namespace Tests\Feature;

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StoreSessionRequestTest extends TestCase
{
    public function test_store_session_returns_structured_errors_when_required_fields_are_missing(): void
    {
        Sanctum::actingAs(new User([
            'name' => 'Test Mentee',
            'email' => 'test-mentee@example.test',
            'role' => 'mentee',
            'status' => 'active',
        ]));

        $response = $this->postJson('/api/v1/sessions', []);

        $response
            ->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validasi gagal.',
            ])
            ->assertJsonValidationErrors([
                'booked_slot_id',
                'topic',
                'message',
                'duration',
                'meeting_type',
            ]);
    }
}
