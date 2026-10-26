<?php

namespace Database\Factories;

use App\Models\Industry;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Profile>
 */
class ProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'industry_id' => Industry::factory(),
            'profile_photo' => null,
            'cover_photo' => null,
            'bio' => fake()->paragraph(),
            'location' => fake()->city(),
            'job_title' => fake()->jobTitle(),
            'company' => fake()->company(),
            'experience_years' => fake()->numberBetween(0, 20),
            'education' => fake()->randomElement([
                'Bachelor Degree',
                'Master Degree',
                'Diploma',
            ]),
            'linkedin_url' => fake()->url(),
            'timezone' => 'Asia/Jakarta',
            'avg_rating' => 0,
            'total_reviews' => 0,
        ];
    }
}
