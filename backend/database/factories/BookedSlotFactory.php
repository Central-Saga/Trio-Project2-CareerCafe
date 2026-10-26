<?php

namespace Database\Factories;

use App\Models\BookedSlot;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BookedSlot>
 */
class BookedSlotFactory extends Factory
{
    public function definition(): array
    {
        $startHour = fake()->numberBetween(9, 16);

        return [
            'mentor_id' => User::factory()->state(['role' => 'mentor']),
            'date' => now()->addDays(30)->toDateString(),
            'start_time' => sprintf('%02d:00:00', $startHour),
            'end_time' => sprintf('%02d:45:00', $startHour),
            'status' => 'available',
            'availability_id' => null,
        ];
    }
}
