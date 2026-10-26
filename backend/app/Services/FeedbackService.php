<?php

namespace App\Services;

use App\Models\Feedback;
use App\Models\Profile;
use App\Models\Session;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class FeedbackService
{
    /**
     * Simpan feedback dan perbarui rating agregat mentor secara atomik.
     */
    public function store(
        Session $session,
        User $mentee,
        array $validated
    ): Feedback {
        return DB::transaction(function () use ($session, $mentee, $validated) {
            $feedback = Feedback::create([
                'session_id' => $session->id,
                'mentor_id' => $session->mentor_id,
                'mentee_id' => $mentee->id,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]);

            $summary = Feedback::where('mentor_id', $session->mentor_id)
                ->selectRaw('COUNT(*) as total_reviews, AVG(rating) as avg_rating')
                ->first();

            Profile::where('user_id', $session->mentor_id)->update([
                'avg_rating' => round((float) ($summary->avg_rating ?? 0), 2),
                'total_reviews' => (int) ($summary->total_reviews ?? 0),
            ]);

            return $feedback;
        });
    }
}
