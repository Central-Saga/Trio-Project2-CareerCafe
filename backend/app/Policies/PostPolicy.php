<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * Pengguna dengan role yang valid boleh membuat postingan.
     * Autentikasi wajib tetap dijaga oleh middleware route.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['mentee', 'mentor', 'admin'], true);
    }

    /**
     * Pemilik postingan atau admin boleh mengeditnya.
     */
    public function update(User $user, Post $post): bool
    {
        return (int) $post->user_id === (int) $user->id
            || $user->role === 'admin';
    }

    /**
     * Pemilik postingan atau admin boleh menghapusnya.
     */
    public function delete(User $user, Post $post): bool
    {
        return $this->update($user, $post);
    }
}
