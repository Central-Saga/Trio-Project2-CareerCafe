<?php

namespace Tests\Feature;

use App\Models\BookedSlot;
use App\Models\Session;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RejectSessionRequestTest extends TestCase
{
    use RefreshDatabase;

    private function createPendingSession(): array
    {
        $mentor = User::factory()->create([
            'role' => 'mentor',
            'status' => 'active',
        ]);

        $mentee = User::factory()->create([
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $slot = BookedSlot::create([
            'mentor_id' => $mentor->id,
            'date' => now()->addDays(5)->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'status' => 'pending',
        ]);

        $session = Session::create([
            'mentor_id' => $mentor->id,
            'mentee_id' => $mentee->id,
            'booked_slot_id' => $slot->id,
            'topic' => 'Career mentoring',
            'message' => 'I would like advice about my career path.',
            'duration' => 45,
            'meeting_type' => 'online',
            'meeting_link' => 'https://meet.google.com',
            'status' => 'pending',
        ]);

        return [$mentor, $session, $slot];
    }

    public function test_rejection_reason_is_required(): void
    {
        [$mentor, $session] = $this->createPendingSession();

        Sanctum::actingAs($mentor);

        $this->patchJson("/api/v1/sessions/{$session->id}/reject", [])
            ->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Alasan penolakan tidak valid.',
            ])
            ->assertJsonValidationErrors(['rejection_reason']);

        $this->assertDatabaseHas('mentoring_sessions', [
            'id' => $session->id,
            'status' => 'pending',
        ]);
    }

    public function test_rejection_reason_must_contain_at_least_five_characters(): void
    {
        [$mentor, $session] = $this->createPendingSession();

        Sanctum::actingAs($mentor);

        $this->patchJson("/api/v1/sessions/{$session->id}/reject", [
            'rejection_reason' => 'no',
        ])
            ->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Alasan penolakan tidak valid.',
            ])
            ->assertJsonValidationErrors(['rejection_reason']);
    }

    public function test_mentor_can_reject_session_and_release_the_slot(): void
    {
        [$mentor, $session, $slot] = $this->createPendingSession();

        Sanctum::actingAs($mentor);

        $reason = 'Jadwal saya tidak sesuai dengan waktu yang diminta.';

        $this->patchJson("/api/v1/sessions/{$session->id}/reject", [
            'rejection_reason' => $reason,
        ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('mentoring_sessions', [
            'id' => $session->id,
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'meeting_link' => null,
        ]);

        $this->assertDatabaseHas('booked_slots', [
            'id' => $slot->id,
            'status' => 'available',
        ]);
    }
}
