<?php

namespace Tests\Unit;

use App\Models\Post;
use App\Models\User;
use App\Policies\PostPolicy;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class PostPolicyTest extends TestCase
{
    private function makeUser(int $id, string $role): User
    {
        $user = new User();

        $user->forceFill([
            'id' => $id,
            'name' => "Test User {$id}",
            'email' => "user{$id}@example.test",
            'role' => $role,
            'status' => 'active',
        ]);

        return $user;
    }

    private function makePost(int $ownerId): Post
    {
        $post = new Post();

        $post->forceFill([
            'id' => 100,
            'user_id' => $ownerId,
            'title' => 'Test post',
            'content' => 'Test content for policy',
            'category' => 'Career Story',
            'status' => 'published',
        ]);

        return $post;
    }

    public function test_post_policy_is_registered(): void
    {
        $this->assertInstanceOf(
            PostPolicy::class,
            Gate::getPolicyFor(Post::class)
        );
    }

    public function test_owner_can_update_and_delete_own_post(): void
    {
        $policy = new PostPolicy();
        $owner = $this->makeUser(10, 'mentee');
        $post = $this->makePost(10);

        $this->assertTrue($policy->update($owner, $post));
        $this->assertTrue($policy->delete($owner, $post));
    }

    public function test_other_user_cannot_update_or_delete_post(): void
    {
        $policy = new PostPolicy();
        $otherUser = $this->makeUser(11, 'mentee');
        $post = $this->makePost(10);

        $this->assertFalse($policy->update($otherUser, $post));
        $this->assertFalse($policy->delete($otherUser, $post));
    }

    public function test_admin_can_update_and_delete_another_users_post(): void
    {
        $policy = new PostPolicy();
        $admin = $this->makeUser(12, 'admin');
        $post = $this->makePost(10);

        $this->assertTrue($policy->update($admin, $post));
        $this->assertTrue($policy->delete($admin, $post));
    }

    public function test_only_supported_roles_can_create_posts(): void
    {
        $policy = new PostPolicy();

        foreach (['mentee', 'mentor', 'admin'] as $role) {
            $this->assertTrue(
                $policy->create($this->makeUser(20, $role)),
                "Role {$role} seharusnya boleh membuat postingan."
            );
        }

        $this->assertFalse(
            $policy->create($this->makeUser(21, 'unknown'))
        );
    }
}
