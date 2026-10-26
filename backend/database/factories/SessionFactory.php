<?php

namespace Database\Factories;

use App\Models\BookedSlot;
use App\Models\Session;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Session>
 */
class SessionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'mentor_id' => User::factory()->state(['role' => 'mentor']),
            'mentee_id' => User::factory()->state(['role' => 'mentee']),
            'booked_slot_id' => BookedSlot::factory(),
            'topic' => fake()->sentence(),
            'message' => fake()->paragraph(),
            'duration' => 45,
            'meeting_type' => 'online',
            'meeting_link' => 'https://meet.google.com',
            'meeting_location' => null,
            'status' => 'pending',
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Session $session): void {
            $session->bookedSlot()->update([
                'mentor_id' => $session->mentor_id,
                'status' => 'booked',
            ]);
        });
    }
}
