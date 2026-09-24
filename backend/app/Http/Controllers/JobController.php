<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\JsonResponse;

class JobController extends Controller
{
    /**
     * Get all active jobs.
     */
    public function index(): JsonResponse
    {
        $jobs = Job::query()
            ->where('is_active', true)
            ->orderByDesc('posted_at')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar lowongan berhasil diambil.',
            'data' => $jobs,
        ]);
    }

    /**
     * Get one active job by ID.
     */
    public function show(int $id): JsonResponse
    {
        $job = Job::query()
            ->where('is_active', true)
            ->find($id);

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
            'data' => $job,
        ]);
    }
}