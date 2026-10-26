<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJobApplicationRequest;
use App\Http\Resources\JobApplicationResource;
use App\Queries\JobApplicationQuery;
use App\Services\JobApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobApplicationController extends Controller
{
    public function __construct(
        private readonly JobApplicationQuery $jobApplicationQuery,
        private readonly JobApplicationService $jobApplicationService
    ) {
    }

    /**
     * GET /api/v1/applications
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'mentee') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya mentee yang dapat melihat daftar lamaran pekerjaan.',
                'data' => null,
            ], 403);
        }

        $applications = $this->jobApplicationQuery->forUser($user->id);

        return response()->json([
            'success' => true,
            'message' => 'Daftar lamaran berhasil diambil.',
            'data' => JobApplicationResource::collection($applications)
                ->resolve($request),
        ]);
    }

    /**
     * POST /api/v1/jobs/{jobId}/apply
     */
    public function store(
        StoreJobApplicationRequest $request,
        int $jobId
    ): JsonResponse {
        $user = $request->user();

        if ($user->role !== 'mentee') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya mentee yang dapat melamar pekerjaan.',
                'data' => null,
            ], 403);
        }

        $job = $this->jobApplicationQuery->findActiveJob($jobId);

        if (!$job) {
            return response()->json([
                'success' => false,
                'message' => 'Lowongan pekerjaan tidak ditemukan.',
                'data' => null,
            ], 404);
        }

        if ($this->jobApplicationQuery->hasApplied($job->id, $user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Kamu sudah pernah melamar pekerjaan ini.',
                'data' => null,
            ], 422);
        }

        $application = $this->jobApplicationService->store(
            $job,
            (int) $user->id,
            $request->validated()
        );

        $application->load('job');

        return response()->json([
            'success' => true,
            'message' => 'Lamaran berhasil dikirim.',
            'data' => JobApplicationResource::make($application)->resolve($request),
        ], 201);
    }
}
