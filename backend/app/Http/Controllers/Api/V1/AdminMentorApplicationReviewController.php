<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\RejectMentorApplicationRequest;
use App\Http\Resources\MentorApplicationResource;
use App\Services\MentorApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;
use Throwable;

class AdminMentorApplicationReviewController extends AdminApiController
{
    public function __construct(
        private readonly MentorApplicationService $service
    ) {
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        try {
            $application = $this->service->approve(
                $id,
                (int) $request->user()->id
            );

            return response()->json([
                'success' => true,
                'message' =>
                    'Pengajuan mentor berhasil disetujui. User sekarang terdaftar sebagai mentor.',
                'data' => MentorApplicationResource::make($application)
                    ->resolve($request),
            ]);
        } catch (RuntimeException $exception) {
            return $this->serviceError(
                $exception,
                'Gagal menyetujui pengajuan mentor.'
            );
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyetujui pengajuan mentor.',
            ], 500);
        }
    }

    public function reject(
        RejectMentorApplicationRequest $request,
        int $id
    ): JsonResponse {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validated = $request->validated();

        try {
            $application = $this->service->reject(
                $id,
                (int) $request->user()->id,
                $validated['rejection_reason']
            );

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan mentor berhasil ditolak.',
                'data' => MentorApplicationResource::make($application)
                    ->resolve($request),
            ]);
        } catch (RuntimeException $exception) {
            return $this->serviceError(
                $exception,
                'Gagal menolak pengajuan mentor.'
            );
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menolak pengajuan mentor.',
            ], 500);
        }
    }
}
