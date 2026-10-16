<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJobApplicationRequest;
use App\Http\Resources\JobApplicationResource;
use App\Models\Job;
use App\Models\JobApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobApplicationController extends Controller
{
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

        $applications = JobApplication::query()
            ->with([
                'job:id,title,company,location,type,category,salary',
            ])
            ->where('user_id', $user->id)
            ->orderByDesc('applied_at')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar lamaran berhasil diambil.',
            'data' => JobApplicationResource::collection($applications)->resolve($request),
        ]);
    }

    public function store(StoreJobApplicationRequest $request, int $jobId): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'mentee') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya mentee yang dapat melamar pekerjaan.',
                'data' => null,
            ], 403);
        }

        $job = Job::query()
            ->where('is_active', true)
            ->find($jobId);

        if (!$job) {
            return response()->json([
                'success' => false,
                'message' => 'Lowongan pekerjaan tidak ditemukan.',
                'data' => null,
            ], 404);
        }

        $alreadyApplied = JobApplication::query()
            ->where('job_id', $job->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadyApplied) {
            return response()->json([
                'success' => false,
                'message' => 'Kamu sudah pernah melamar pekerjaan ini.',
                'data' => null,
            ], 422);
        }

        $validated = $request->validated();

        $cvPath = $validated['cv']->store('applications/cv');

        $application = JobApplication::create([
            'job_id' => $job->id,
            'user_id' => $user->id,
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'cv_path' => $cvPath,
            'cover_letter' => $validated['cover_letter'] ?? null,
            'portfolio_url' => $validated['portfolio_url'] ?? null,
            'status' => 'pending',
            'applied_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lamaran berhasil dikirim.',
            'data' => JobApplicationResource::make($application->load('job'))->resolve($request),
        ], 201);
    }
}
