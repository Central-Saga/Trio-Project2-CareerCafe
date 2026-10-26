<?php

namespace Database\Factories;

use App\Models\Industry;
use App\Models\MentorApplication;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MentorApplication>
 */
class MentorApplicationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => 'mentee']),
            'full_name' => fake()->name(),
            'job_title' => fake()->jobTitle(),
            'company' => fake()->company(),
            'location' => fake()->city(),
            'experience_years' => fake()->numberBetween(1, 20),
            'education' => 'Bachelor Degree',
            'industry_id' => Industry::factory(),
            'bio' => fake()->paragraph(),
            'motivation' => fake()->paragraph(),
            'linkedin_url' => fake()->url(),
            'skills' => [],
            'status' => 'pending',
            'reviewed_by' => null,
            'rejection_reason' => null,
            'reviewed_at' => null,
        ];
    }
}
