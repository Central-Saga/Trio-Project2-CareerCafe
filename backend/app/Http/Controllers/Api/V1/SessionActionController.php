<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\RejectSessionRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionActionController extends SessionActionApiController
{
    public function approve(Request $request, int $id): JsonResponse
    {
        return $this->transition(
            $request,
            $id,
            'approve',
            fn () => $this->sessionService->approve($id),
            'Sesi coffee chat telah disetujui.'
        );
    }

    public function reject(
        RejectSessionRequest $request,
        int $id
    ): JsonResponse {
        $reason = trim($request->validated()['rejection_reason']);

        if (mb_strlen($reason) < 5) {
            return response()->json([
                'success' => false,
                'message' => 'Alasan penolakan minimal 5 karakter.',
                'errors' => [
                    'rejection_reason' => [
                        'Alasan penolakan minimal 5 karakter.',
                    ],
                ],
            ], 422);
        }

        return $this->transition(
            $request,
            $id,
            'reject',
            fn () => $this->sessionService->reject($id, $reason),
            'Sesi coffee chat telah ditolak dan slot dikembalikan.'
        );
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        return $this->transition(
            $request,
            $id,
            'cancel',
            fn () => $this->sessionService->cancel($id),
            'Sesi coffee chat telah dibatalkan.'
        );
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        return $this->transition(
            $request,
            $id,
            'complete',
            fn () => $this->sessionService->complete($id),
            'Sesi coffee chat telah berhasil diselesaikan.'
        );
    }
}
