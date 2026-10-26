<?php

namespace Tests\Feature;

use App\Models\BookedSlot;
use App\Models\Session;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SessionPolicyEndpointTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'status' => 'active',
        ]);
    }

    private function makeSession(
        User $mentor,
        User $mentee,
        string $status = 'pending'
    ): Session {
        $slot = BookedSlot::create([
            'mentor_id' => $mentor->id,
            'date' => now()->addDays(5)->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'status' => $status === 'approved' ? 'booked' : 'pending',
        ]);

        return Session::create([
            'mentor_id' => $mentor->id,
            'mentee_id' => $mentee->id,
            'booked_slot_id' => $slot->id,
            'topic' => 'Career mentoring',
            'message' => 'I would like advice about my career path.',
            'duration' => 45,
            'meeting_type' => 'online',
            'meeting_link' => 'https://meet.google.com',
            'status' => $status,
        ]);
    }

    public function test_unrelated_user_cannot_view_session(): void
    {
        $mentor = $this->makeUser('mentor');
        $mentee = $this->makeUser('mentee');
        $other = $this->makeUser('mentee');
        $session = $this->makeSession($mentor, $mentee);

        Sanctum::actingAs($other);

        $this->getJson("/api/v1/sessions/{$session->id}")
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_targeted_mentor_can_approve_session(): void
    {
        $mentor = $this->makeUser('mentor');
        $mentee = $this->makeUser('mentee');
        $session = $this->makeSession($mentor, $mentee);

        Sanctum::actingAs($mentor);

        $this->patchJson("/api/v1/sessions/{$session->id}/approve")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('mentoring_sessions', [
            'id' => $session->id,
            'status' => 'approved',
        ]);

        $this->assertDatabaseHas('booked_slots', [
            'id' => $session->booked_slot_id,
            'status' => 'booked',
        ]);
    }

    public function test_other_mentor_cannot_approve_session(): void
    {
        $mentor = $this->makeUser('mentor');
        $otherMentor = $this->makeUser('mentor');
        $mentee = $this->makeUser('mentee');
        $session = $this->makeSession($mentor, $mentee);

        Sanctum::actingAs($otherMentor);

        $this->patchJson("/api/v1/sessions/{$session->id}/approve")
            ->assertForbidden()
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('mentoring_sessions', [
            'id' => $session->id,
            'status' => 'pending',
        ]);
    }

    public function test_other_mentor_cannot_reject_session(): void
    {
        $mentor = $this->makeUser('mentor');
        $otherMentor = $this->makeUser('mentor');
        $mentee = $this->makeUser('mentee');
        $session = $this->makeSession($mentor, $mentee);

        Sanctum::actingAs($otherMentor);

        $this->patchJson("/api/v1/sessions/{$session->id}/reject", [
            'rejection_reason' => 'This request belongs to another mentor.',
        ])
            ->assertForbidden()
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('mentoring_sessions', [
            'id' => $session->id,
            'status' => 'pending',
        ]);
    }

    public function test_unrelated_user_cannot_cancel_session(): void
    {
        $mentor = $this->makeUser('mentor');
        $mentee = $this->makeUser('mentee');
        $other = $this->makeUser('mentee');
        $session = $this->makeSession($mentor, $mentee);

        Sanctum::actingAs($other);

        $this->patchJson("/api/v1/sessions/{$session->id}/cancel")
            ->assertForbidden()
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('mentoring_sessions', [
            'id' => $session->id,
            'status' => 'pending',
        ]);
    }

    public function test_mentee_cannot_mark_session_completed(): void
    {
        $mentor = $this->makeUser('mentor');
        $mentee = $this->makeUser('mentee');
        $session = $this->makeSession($mentor, $mentee, 'approved');

        Sanctum::actingAs($mentee);

        $this->patchJson("/api/v1/sessions/{$session->id}/complete")
            ->assertForbidden()
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('mentoring_sessions', [
            'id' => $session->id,
            'status' => 'approved',
        ]);
    }

    public function test_admin_can_mark_approved_session_completed(): void
    {
        $mentor = $this->makeUser('mentor');
        $mentee = $this->makeUser('mentee');
        $admin = $this->makeUser('admin');
        $session = $this->makeSession($mentor, $mentee, 'approved');

        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/sessions/{$session->id}/complete")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('mentoring_sessions', [
            'id' => $session->id,
            'status' => 'completed',
        ]);
    }

    public function test_unsupported_role_cannot_create_session(): void
    {
        $mentor = $this->makeUser('mentor');
        $viewer = $this->makeUser('viewer');

        $slot = BookedSlot::create([
            'mentor_id' => $mentor->id,
            'date' => now()->addDays(6)->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'status' => 'available',
        ]);

        Sanctum::actingAs($viewer);

        $this->postJson('/api/v1/sessions', [
            'booked_slot_id' => $slot->id,
            'topic' => 'Career mentoring',
            'message' => 'I would like advice about my career path.',
            'duration' => 45,
            'meeting_type' => 'online',
        ])
            ->assertForbidden()
            ->assertJsonPath('success', false);

        $this->assertDatabaseCount('mentoring_sessions', 0);

        $this->assertDatabaseHas('booked_slots', [
            'id' => $slot->id,
            'status' => 'available',
        ]);
    }
}
