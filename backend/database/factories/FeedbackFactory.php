<?php

namespace Database\Factories;

use App\Models\Feedback;
use App\Models\Session;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Feedback>
 */
class FeedbackFactory extends Factory
{
    public function definition(): array
    {
        return [
            'session_id' => Session::factory(),
            'mentor_id' => null,
            'mentee_id' => null,
            'rating' => fake()->numberBetween(1, 5),
            'comment' => fake()->sentence(),
        ];
    }

    public function configure(): static
    {
        return $this->afterMaking(function (Feedback $feedback): void {
            $session = $feedback->session()->firstOrFail();

            $feedback->forceFill([
                'mentor_id' => $session->mentor_id,
                'mentee_id' => $session->mentee_id,
            ]);
        });
    }
}
