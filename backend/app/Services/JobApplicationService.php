<?php

namespace App\Services;

use App\Models\Job;
use App\Models\JobApplication;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class JobApplicationService
{
    /**
     * Simpan CV dan data lamaran.
     *
     * File CV dibersihkan jika transaksi database gagal.
     */
    public function store(
        Job $job,
        int $userId,
        array $validated
    ): JobApplication {
        $cvPath = $validated['cv']->store('applications/cv');

        if (!$cvPath) {
            throw new RuntimeException('File CV gagal disimpan.');
        }

        try {
            return DB::transaction(function () use (
                $job,
                $userId,
                $validated,
                $cvPath
            ) {
                return JobApplication::create([
                    'job_id' => $job->id,
                    'user_id' => $userId,
                    'full_name' => $validated['full_name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'] ?? null,
                    'cv_path' => $cvPath,
                    'cover_letter' => $validated['cover_letter'] ?? null,
                    'portfolio_url' => $validated['portfolio_url'] ?? null,
                    'status' => 'pending',
                    'applied_at' => now(),
                ]);
            });
        } catch (Throwable $exception) {
            Storage::delete($cvPath);

            throw $exception;
        }
    }
}
