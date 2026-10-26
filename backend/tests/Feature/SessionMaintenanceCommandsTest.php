<?php

namespace Tests\Feature;

use App\Models\Availability;
use App\Models\BookedSlot;
use App\Models\Session;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SessionMaintenanceCommandsTest extends TestCase
{
    use RefreshDatabase;

    private int $slotIndex = 0;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_expire_command_only_expires_pending_sessions_older_than_48_hours(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-26 12:00:00', 'UTC'));

        $mentor = User::factory()->create(['role' => 'mentor']);
        $mentee = User::factory()->create(['role' => 'mentee']);
        $oldPending = $this->makeSession($mentor, $mentee, 'pending');
        $oldPending->forceFill(['created_at' => now()->subHours(49)])->save();
        $oldPending->bookedSlot->update(['status' => 'pending']);
        $newPending = $this->makeSession($mentor, $mentee, 'pending');
        $newPending->forceFill(['created_at' => now()->subHours(47)])->save();
        $newPending->bookedSlot->update(['status' => 'pending']);
        $oldApproved = $this->makeSession($mentor, $mentee, 'approved');
        $oldApproved->forceFill(['created_at' => now()->subHours(72)])->save();
        $oldApproved->bookedSlot->update(['status' => 'booked']);

        $this->artisan('sessions:expire')->assertExitCode(0);

        $this->assertSame('expired', $oldPending->fresh()->status);
        $this->assertSame('available', $oldPending->bookedSlot->fresh()->status);
        $this->assertSame('pending', $newPending->fresh()->status);
        $this->assertSame('pending', $newPending->bookedSlot->fresh()->status);
        $this->assertSame('approved', $oldApproved->fresh()->status);
        $this->assertSame('booked', $oldApproved->bookedSlot->fresh()->status);
    }

    public function test_auto_complete_command_only_completes_approved_sessions_after_slot_end(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-26 12:00:00', 'UTC'));

        $mentor = User::factory()->create(['role' => 'mentor']);
        $mentee = User::factory()->create(['role' => 'mentee']);
        $elapsed = $this->makeSession($mentor, $mentee, 'approved');
        $elapsed->bookedSlot->update([
            'date' => '2026-10-25',
            'end_time' => '11:00:00',
        ]);
        $notElapsed = $this->makeSession($mentor, $mentee, 'approved');
        $notElapsed->bookedSlot->update([
            'date' => '2026-10-26',
            'end_time' => '12:01:00',
        ]);
        $pending = $this->makeSession($mentor, $mentee, 'pending');
        $pending->bookedSlot->update([
            'date' => '2026-10-25',
            'end_time' => '11:00:00',
        ]);

        $this->artisan('sessions:autocomplete')->assertExitCode(0);

        $this->assertSame('completed', $elapsed->fresh()->status);
        $this->assertSame('approved', $notElapsed->fresh()->status);
        $this->assertSame('pending', $pending->fresh()->status);
    }

    public function test_generate_slots_command_is_idempotent(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-26 12:00:00', 'UTC'));

        $mentor = User::factory()->create([
            'role' => 'mentor',
            'status' => 'active',
        ]);
        Availability::factory()->create([
            'mentor_id' => $mentor->id,
            'day_of_week' => 1,
            'start_time' => '09:00:00',
            'end_time' => '10:30:00',
        ]);

        $this->artisan('slots:generate', ['--weeks' => 1])->assertExitCode(0);
        $firstRunCount = BookedSlot::query()
            ->where('mentor_id', $mentor->id)
            ->count();

        $this->artisan('slots:generate', ['--weeks' => 1])->assertExitCode(0);

        $this->assertSame(4, $firstRunCount);
        $this->assertSame(
            $firstRunCount,
            BookedSlot::query()->where('mentor_id', $mentor->id)->count(),
        );
    }

    private function makeSession(
        User $mentor,
        User $mentee,
        string $status,
    ): Session {
        $startHour = 8 + $this->slotIndex++;
        $slot = BookedSlot::factory()->create([
            'mentor_id' => $mentor->id,
            'date' => '2030-01-01',
            'start_time' => sprintf('%02d:00:00', $startHour),
            'end_time' => sprintf('%02d:45:00', $startHour),
            'status' => $status === 'approved' ? 'booked' : 'pending',
        ]);

        return Session::factory()->create([
            'mentor_id' => $mentor->id,
            'mentee_id' => $mentee->id,
            'booked_slot_id' => $slot->id,
            'status' => $status,
        ]);
    }
}
