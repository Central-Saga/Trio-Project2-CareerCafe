<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JobApplicationController extends Controller
{
    /**
     * Mengambil semua lamaran milik user yang sedang login.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

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

    /**
     * Mengirim lamaran pekerjaan.
     */
    public function store(Request $request, int $jobId): JsonResponse
    {
        // Pastikan pekerjaan tersedia dan masih aktif.
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

        // User yang sedang login.
        $user = $request->user();

        // Cek apakah user sudah pernah melamar pekerjaan ini.
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

        // Validasi data lamaran.
        $validator = Validator::make(
            $request->all(),
            [
                'full_name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255'],
                'phone' => ['nullable', 'string', 'max:50'],
                'cv' => [
                    'required',
                    'file',
                    'mimes:pdf',
                    'max:5120',
                ],
                'cover_letter' => ['nullable', 'string'],
                'portfolio_url' => ['nullable', 'url', 'max:255'],
            ],
            [
                'full_name.required' => 'Nama lengkap wajib diisi.',

                'email.required' => 'Email wajib diisi.',
                'email.email' => 'Format email tidak valid.',

                'cv.required' => 'CV wajib diunggah.',
                'cv.file' => 'CV harus berupa file yang valid.',
                'cv.mimes' => 'Format CV harus PDF.',
                'cv.max' => 'Ukuran CV maksimal 5 MB.',

                'portfolio_url.url' => 'Format URL portfolio tidak valid.',
            ],
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data lamaran tidak valid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Upload CV
        |--------------------------------------------------------------------------
        |
        | CV disimpan pada storage Laravel:
        |
        | storage/app/applications/cv
        |
        */

        $cvPath = $request->file('cv')->store('applications/cv');

        // Simpan lamaran.
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