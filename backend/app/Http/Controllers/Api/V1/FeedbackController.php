<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFeedbackRequest;
use App\Http\Resources\FeedbackResource;
use App\Models\User;
use App\Queries\FeedbackQuery;
use App\Queries\SessionQuery;
use App\Services\FeedbackService;

class FeedbackController extends Controller
{
    public function __construct(
        private readonly FeedbackService $feedbackService,
        private readonly FeedbackQuery $feedbackQuery,
        private readonly SessionQuery $sessionQuery
    ) {
    }

    /**
     * POST /api/v1/sessions/{id}/feedback
     */
    public function store(StoreFeedbackRequest $request, $sessionId)
    {
        $session = $this->sessionQuery->findById($sessionId);

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak ditemukan.',
            ], 404);
        }

        /** @var User $mentee */
        $mentee = $request->user();

        $feedback = $this->feedbackService->store(
            $session,
            $mentee,
            $request->validated()
        );

        $feedback->load(['mentee:id,name', 'session']);

        return response()->json([
            'success' => true,
            'message' => 'Terima kasih, ulasan dan rating berhasil disimpan.',
            'data' => (new FeedbackResource($feedback))->resolve($request),
        ], 201);
    }

    /**
     * GET /api/v1/mentors/{mentorId}/feedbacks
     */
    public function mentorFeedbacks($mentorId)
    {
        $feedbacks = $this->feedbackQuery->forMentor($mentorId);

        return response()->json([
            'success' => true,
            'message' => 'Daftar ulasan mentor berhasil diambil.',
            'data' => FeedbackResource::collection($feedbacks)->resolve(request()),
        ]);
    }
}
