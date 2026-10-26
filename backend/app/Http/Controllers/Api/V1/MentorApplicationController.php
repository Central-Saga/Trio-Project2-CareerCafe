<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMentorApplicationRequest;
use App\Http\Resources\MentorApplicationResource;
use App\Queries\MentorApplicationQuery;
use App\Services\MentorApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class MentorApplicationController extends Controller
{
    public function __construct(
        private readonly MentorApplicationQuery $query,
        private readonly MentorApplicationService $service
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $applications = $this->query->forUser(
            (int) $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Riwayat pengajuan mentor berhasil diambil.',
            'data' => MentorApplicationResource::collection($applications)
                ->resolve($request),
        ]);
    }

    public function store(
        StoreMentorApplicationRequest $request
    ): JsonResponse {
        $validated = $request->validated();

        if (
            count($validated['documents'] ?? []) !==
            count($validated['document_types'] ?? [])
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Data jenis dokumen tidak sesuai dengan jumlah file yang diunggah.',
                'errors' => [
                    'documents' => [
                        'Setiap dokumen harus memiliki jenis dokumen.',
                    ],
                ],
            ], 422);
        }

        try {
            $application = $this->service->submit(
                (int) $request->user()->id,
                $validated
            );

            return response()->json([
                'success' => true,
                'message' =>
                    'Pengajuan mentor berhasil dikirim dan sedang menunggu review admin.',
                'data' => MentorApplicationResource::make($application)
                    ->resolve($request),
            ], 201);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' =>
                    'Pengajuan mentor gagal disimpan. Silakan coba lagi.',
            ], 500);
        }
    }
}
