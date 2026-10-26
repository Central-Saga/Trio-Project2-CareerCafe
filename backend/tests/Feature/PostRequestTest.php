<?php

namespace Tests\Feature;

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PostRequestTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(new User([
            'name' => 'Test User',
            'email' => 'post-test@example.test',
            'role' => 'mentee',
            'status' => 'active',
        ]));
    }

    public function test_store_post_requires_valid_input(): void
    {
        $this->postJson('/api/v1/posts', [])
            ->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validasi postingan gagal.',
            ])
            ->assertJsonValidationErrors([
                'title',
                'content',
                'category',
            ]);
    }

    public function test_update_post_rejects_invalid_title(): void
    {
        $this->putJson('/api/v1/posts/999', [
            'title' => 'ab',
        ])
            ->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validasi pembaruan postingan gagal.',
            ])
            ->assertJsonValidationErrors(['title']);
    }
}
