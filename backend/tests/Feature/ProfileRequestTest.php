<?php

namespace Tests\Feature;

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileRequestTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(new User([
            'name' => 'Profile Test User',
            'email' => 'profile-test@example.test',
            'role' => 'mentee',
            'status' => 'active',
        ]));
    }

    public function test_update_profile_rejects_bio_that_is_too_long(): void
    {
        $this->putJson('/api/v1/profile', [
            'bio' => str_repeat('a', 1001),
        ])
            ->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validasi pembaruan profil gagal.',
            ])
            ->assertJsonValidationErrors(['bio']);
    }

    public function test_upload_photo_requires_a_file(): void
    {
        $this->postJson('/api/v1/profile/photo', [])
            ->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validasi foto gagal. File harus bertipe jpg, jpeg, png, atau webp dan maksimal 2MB.',
            ])
            ->assertJsonValidationErrors(['photo']);
    }

    public function test_upload_cover_requires_a_file(): void
    {
        $this->postJson('/api/v1/profile/cover', [])
            ->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validasi background gagal. File harus bertipe jpg, jpeg, png, atau webp dan maksimal 2MB.',
            ])
            ->assertJsonValidationErrors(['cover']);
    }
}
