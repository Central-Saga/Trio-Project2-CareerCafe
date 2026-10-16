<?php

namespace App\Policies;

use App\Models\Session;
use App\Models\User;

class SessionPolicy
{
    /**
     * Hanya mentee yang dapat membuat permintaan sesi.
     */
    public function create(User $user): bool
    {
        return $user->role === 'mentee';
    }

    /**
     * Pengguna dapat melihat sesi jika terlibat atau merupakan admin.
     */
    public function view(User $user, Session $session): bool
    {
        return $user->role === 'admin'
            || (int) $session->mentor_id === (int) $user->id
            || (int) $session->mentee_id === (int) $user->id;
    }

    /**
     * Hanya mentor yang dituju dapat menyetujui sesi.
     * Pemeriksaan status pending tetap dilakukan oleh controller.
     */
    public function approve(User $user, Session $session): bool
    {
        return $user->role === 'mentor'
            && (int) $session->mentor_id === (int) $user->id;
    }

    /**
     * Hanya mentor yang dituju dapat menolak sesi.
     */
    public function reject(User $user, Session $session): bool
    {
        return $user->role === 'mentor'
            && (int) $session->mentor_id === (int) $user->id;
    }

    /**
     * Hanya peserta sesi yang dapat membatalkannya.
     */
    public function cancel(User $user, Session $session): bool
    {
        return (int) $session->mentor_id === (int) $user->id
            || (int) $session->mentee_id === (int) $user->id;
    }

    /**
     * Mentor pemilik sesi atau admin dapat menandai sesi selesai.
     */
    public function complete(User $user, Session $session): bool
    {
        return $user->role === 'admin'
            || (
                $user->role === 'mentor'
                && (int) $session->mentor_id === (int) $user->id
            );
    }
}
