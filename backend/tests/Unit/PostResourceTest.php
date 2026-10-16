<?php

namespace Tests\Unit;

use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\Request;
use Tests\TestCase;

class PostResourceTest extends TestCase
{
    public function test_post_resource_returns_frontend_fields_and_safe_author_data(): void
    {
        $profile = new Profile();
        $profile->forceFill([
            'profile_photo' => 'profiles/test.png',
            'job_title' => 'Software Developer',
            'company' => 'Career Cafe',
            'bio' => 'Software development enthusiast.',
        ]);

        $user = new User();
        $user->forceFill([
            'id' => 10,
            'name' => 'Test Author',
            'email' => 'private@example.test',
            'password' => 'must-not-be-exposed',
            'role' => 'mentor',
        ]);
        $user->setRelation('profile', $profile);

        $post = new Post();
        $post->forceFill([
            'id' => 101,
            'user_id' => 10,
            'title' => 'Career Story',
            'content' => 'A test post for the Career Feed.',
            'category' => 'Career Story',
            'status' => 'published',
            'created_at' => '2026-10-16 08:00:00',
            'updated_at' => '2026-10-16 08:00:00',
        ]);
        $post->setRelation('user', $user);

        $data = (new PostResource($post))
            ->resolve(Request::create('/api/posts'));

        $this->assertSame(101, $data['id']);
        $this->assertSame(10, $data['user_id']);
        $this->assertSame('Career Story', $data['title']);
        $this->assertSame('Career Story', $data['category']);
        $this->assertSame('Test Author', $data['user']['name']);
        $this->assertSame('mentor', $data['user']['role']);
        $this->assertSame(
            'Software Developer',
            $data['user']['profile']['job_title']
        );

        $this->assertArrayNotHasKey('email', $data['user']);
        $this->assertArrayNotHasKey('password', $data['user']);
    }

    public function test_post_resource_omits_author_when_relation_is_not_loaded(): void
    {
        $post = new Post();
        $post->forceFill([
            'id' => 102,
            'user_id' => 11,
            'title' => 'Another post',
            'content' => 'Post without its author relation loaded.',
            'category' => 'Industry Insight',
            'status' => 'published',
        ]);

        $data = (new PostResource($post))
            ->resolve(Request::create('/api/posts'));

        $this->assertSame(102, $data['id']);
        $this->assertArrayNotHasKey('user', $data);
    }
}
