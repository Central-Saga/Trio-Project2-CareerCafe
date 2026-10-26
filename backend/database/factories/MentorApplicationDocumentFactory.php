<?php

namespace Database\Factories;

use App\Models\MentorApplication;
use App\Models\MentorApplicationDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MentorApplicationDocument>
 */
class MentorApplicationDocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'mentor_application_id' => MentorApplication::factory(),
            'document_type' => 'certificate',
            'original_name' => fake()->word().'.pdf',
            'file_path' => 'mentor-applications/demo/certificate.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => fake()->numberBetween(1024, 2_000_000),
        ];
    }
}
