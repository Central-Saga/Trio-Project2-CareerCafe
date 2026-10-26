<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;

class PostService
{
    public function create(User $user, array $validated): Post
    {
        $post = Post::query()->create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'category' => $validated['category'],
            'status' => 'published',
        ]);

        return $post->load([
            'user:id,name,role',
            'user.profile:id,user_id,profile_photo,job_title,company',
        ]);
    }

    public function update(Post $post, array $validated): Post
    {
        $post->update($validated);

        return $post->fresh([
            'user:id,name,role',
            'user.profile',
        ]);
    }

    public function delete(Post $post): void
    {
        $post->delete();
    }
}