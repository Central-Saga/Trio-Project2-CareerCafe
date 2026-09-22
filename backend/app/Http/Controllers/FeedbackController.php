<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\Profile;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class FeedbackController extends Controller
{
    /**
     * Store feedback for a completed session and atomically update mentor's cached rating (AC-10, FR-13, FR-14).
     */
    public function store(Request $request, $sessionId)
    {
        $mentee = $request->user();

        $session = Session::find($sessionId);

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak ditemukan.',
            ], 404);
        }

        // Business Rule 4: Feedback hanya bisa diberikan jika session.status = completed
        if ($session->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Feedback hanya dapat diberikan untuk sesi yang telah selesai (completed).',
            ], 422);
        }

        // Pastikan hanya mentee pada sesi ini yang dapat memberikan feedback
        if ($session->mentee_id !== $mentee->id) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya mentee peserta sesi yang dapat memberikan ulasan.',
            ], 403);
        }

        // Business Rule 5: feedbacks.session_id UNIQUE — satu sesi satu feedback
        $existing = Feedback::where('session_id', $session->id)->first();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memberikan feedback untuk sesi ini.',
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi rating gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // AC-10: Cached Rating update within database transaction
        $feedback = DB::transaction(function () use ($request, $session, $mentee) {
            $created = Feedback::create([
                'session_id' => $session->id,
                'mentor_id' => $session->mentor_id,
                'mentee_id' => $mentee->id,
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);

            // Hitung ulang dan update kolom cached di tabel profiles milik mentor
            $mentorId = $session->mentor_id;
            $feedbacks = Feedback::where('mentor_id', $mentorId);
            $totalReviews = $feedbacks->count();
            $avgRating = round($feedbacks->avg('rating'), 2);

            Profile::where('user_id', $mentorId)->update([
                'avg_rating' => $avgRating,
                'total_reviews' => $totalReviews,
            ]);

            return $created;
        });

        return response()->json([
            'success' => true,
            'message' => 'Terima kasih, ulasan dan rating berhasil disimpan.',
            'data' => $feedback->load(['mentee:id,name', 'session']),
        ], 201);
    }

    /**
     * Get all feedbacks of a specific mentor (PRD Section 13).
     */
    public function mentorFeedbacks($mentorId)
    {
        $feedbacks = Feedback::with(['mentee:id,name', 'mentee.profile:id,user_id,profile_photo'])
            ->where('mentor_id', $mentorId)
            ->latest('id')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar ulasan mentor berhasil diambil.',
            'data' => $feedbacks,
        ]);
    }
}
