<?php

namespace App\Queries;

use App\Models\Session;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class SessionQuery
{
    /**
     * Mencari sesi berdasarkan ID.
     */
    public function findById(int|string $id): ?Session
    {
        return Session::query()->find($id);
    }

    /**
     * Query sesi yang boleh ditampilkan kepada pengguna.
     */
    public function forUser(User $user): Builder
    {
        $query = Session::query()->with([
            'mentor:id,name,email',
            'mentor.profile:id,user_id,profile_photo,job_title,company,timezone',
            'mentee:id,name,email',
            'mentee.profile:id,user_id,profile_photo,timezone',
            'bookedSlot',
            'feedback',
        ]);

        if ($user->role === 'mentor') {
            return $query->where('mentor_id', $user->id);
        }

        return $query->where('mentee_id', $user->id);
    }

    /**
     * Menerapkan filter tab atau status pada daftar sesi.
     */
    public function applyFilters(
        Builder $query,
        Request $request
    ): Builder {
        if ($request->filled('tab')) {
            switch ($request->input('tab')) {
                case 'upcoming':
                    $query->where('status', 'approved');
                    break;

                case 'pending':
                    $query->where('status', 'pending');
                    break;

                case 'completed':
                    $query->where('status', 'completed');
                    break;

                case 'cancelled':
                    $query->whereIn(
                        'status',
                        ['cancelled', 'rejected', 'expired']
                    );
                    break;
            }
        } elseif ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return $query;
    }

    /**
     * Mengambil detail sesi beserta relasi yang diperlukan.
     */
    public function findWithDetails(int $id): ?Session
    {
        return Session::query()
            ->with([
                'mentor:id,name,email',
                'mentor.profile',
                'mentee:id,name,email',
                'mentee.profile',
                'bookedSlot',
                'feedback',
            ])
            ->find($id);
    }
}
