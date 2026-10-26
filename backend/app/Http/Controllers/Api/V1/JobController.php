<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobResource;
use App\Queries\JobQuery;
use Illuminate\Http\JsonResponse;

class JobController extends Controller
{
    public function __construct(
        private readonly JobQuery $jobQuery
    ) {
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Daftar lowongan berhasil diambil.',
            'data' => JobResource::collection(
                $this->jobQuery->allActive()
            )->resolve(request()),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $job = $this->jobQuery->findActive($id);

        if (!$job) {
            return response()->json([
                'success' => false,
                'message' => 'Lowongan tidak ditemukan.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail lowongan berhasil diambil.',
            'data' => JobResource::make($job)->resolve(request()),
        ]);
    }
}
