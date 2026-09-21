<?php

namespace Database\Factories;

use App\Models\Job;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Job>
 */
class JobFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
    return [
        'title' => fake()->jobTitle(),
        'company' => fake()->company(),
        'description' => fake()->paragraph(3),
        'location' => fake()->city(),
        'salary' => 'Rp ' . fake()->numberBetween(3, 15) . '.000.000',
    ];
    }
}
