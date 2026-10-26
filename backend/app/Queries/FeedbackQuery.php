<?php

namespace App\Queries;

use App\Models\Feedback;
use Illuminate\Database\Eloquent\Collection;

class FeedbackQuery
{
    /**
     * Ambil ulasan mentor beserta nama dan foto profil pemberi ulasan.
     */
    public function forMentor(int|string $mentorId): Collection
    {
        return Feedback::with([
            'mentee:id,name',
            'mentee.profile:id,user_id,profile_photo',
        ])
            ->where('mentor_id', $mentorId)
            ->latest('id')
            ->get();
    }
}
