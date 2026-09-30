<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
            'data' => $applications,
        ]);
    }

    public function store(Request $request, int $jobId): JsonResponse
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

        $validator = Validator::make(
            $request->all(),
            [
                'full_name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255'],
                'phone' => ['nullable', 'string', 'max:50'],
                'cv' => ['required', 'file', 'mimes:pdf', 'max:5120'],
                'cover_letter' => ['nullable', 'string'],
                'portfolio_url' => ['nullable', 'url', 'max:255'],
            ],
            [
                'full_name.required' => 'Nama lengkap wajib diisi.',
                'email.required' => 'Email wajib diisi.',
                'email.email' => 'Format email tidak valid.',
                'cv.required' => 'CV wajib diunggah.',
                'cv.file' => 'CV harus berupa file.',
                'cv.mimes' => 'CV harus dalam format PDF.',
                'cv.max' => 'Ukuran CV maksimal 5 MB.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
                'data' => null,
            ], 422);
        }

        $cvPath = $request->file('cv')->store('applications/cv');

        $application = JobApplication::create([
            'job_id' => $job->id,
            'user_id' => $user->id,
            'full_name' => $request->input('full_name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'cv_path' => $cvPath,
            'cover_letter' => $request->input('cover_letter'),
            'portfolio_url' => $request->input('portfolio_url'),
            'status' => 'pending',
            'applied_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lamaran berhasil dikirim.',
            'data' => $application,
        ], 201);
    }
}
