<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StoreJobApplicationRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_job_application_requires_valid_input(): void
    {
        $mentee = User::factory()->create([
            'role' => 'mentee',
            'status' => 'active',
        ]);

        Sanctum::actingAs($mentee);

        $this->postJson('/api/v1/jobs/999/apply', [])
            ->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validasi gagal.',
                'data' => null,
            ])
            ->assertJsonValidationErrors([
                'full_name',
                'email',
                'cv',
            ]);
    }
}
