<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PostPolicyEndpointTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $email, string $role): User
    {
        return User::factory()->create([
            'name' => 'Test User',
            'email' => $email,
            'role' => $role,
            'status' => 'active',
        ]);
    }

    private function makePost(User $owner): Post
    {
        return Post::create([
            'user_id' => $owner->id,
            'title' => 'Original career post',
            'content' => 'This is a test post for authorization.',
            'category' => 'Career Story',
            'status' => 'published',
        ]);
    }

    public function test_mentee_can_create_post_and_persist_it(): void
    {
        $owner = $this->makeUser('owner-create@example.test', 'mentee');

        Sanctum::actingAs($owner);

        $this->postJson('/api/posts', [
            'title' => 'New career post',
            'content' => 'This is a valid test post created for the community feed.',
            'category' => 'Career Story',
        ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'New career post');

        $this->assertDatabaseHas('posts', [
            'user_id' => $owner->id,
            'title' => 'New career post',
            'status' => 'published',
        ]);
    }

    public function test_owner_can_update_own_post(): void
    {
        $owner = $this->makeUser('owner@example.test', 'mentee');
        $post = $this->makePost($owner);

        Sanctum::actingAs($owner);

        $this->putJson("/api/posts/{$post->id}", [
            'title' => 'Updated career post',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Updated career post');
    }

    public function test_other_user_cannot_update_post(): void
    {
        $owner = $this->makeUser('owner-update@example.test', 'mentee');
        $other = $this->makeUser('other-update@example.test', 'mentee');
        $post = $this->makePost($owner);

        Sanctum::actingAs($other);

        $this->putJson("/api/posts/{$post->id}", [
            'title' => 'Unauthorized update',
        ])
            ->assertForbidden()
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'title' => 'Original career post',
        ]);
    }

    public function test_admin_can_update_another_users_post(): void
    {
        $owner = $this->makeUser('owner-admin@example.test', 'mentee');
        $admin = $this->makeUser('admin-update@example.test', 'admin');
        $post = $this->makePost($owner);

        Sanctum::actingAs($admin);

        $this->putJson("/api/posts/{$post->id}", [
            'title' => 'Admin updated post',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Admin updated post');
    }

    public function test_owner_can_delete_own_post(): void
    {
        $owner = $this->makeUser('owner-delete@example.test', 'mentee');
        $post = $this->makePost($owner);

        Sanctum::actingAs($owner);

        $this->deleteJson("/api/posts/{$post->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('posts', [
            'id' => $post->id,
        ]);
    }

    public function test_other_user_cannot_delete_post(): void
    {
        $owner = $this->makeUser('owner-protect@example.test', 'mentee');
        $other = $this->makeUser('other-delete@example.test', 'mentor');
        $post = $this->makePost($owner);

        Sanctum::actingAs($other);

        $this->deleteJson("/api/posts/{$post->id}")
            ->assertForbidden()
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
        ]);
    }

    public function test_role_outside_policy_cannot_create_post(): void
    {
        $user = $this->makeUser('unknown-role@example.test', 'viewer');

        Sanctum::actingAs($user);

        $this->postJson('/api/posts', [
            'title' => 'A valid test title',
            'content' => 'This content is long enough for validation.',
            'category' => 'Career Story',
        ])
            ->assertForbidden()
            ->assertJsonPath('success', false);

        $this->assertDatabaseCount('posts', 0);
    }
}
