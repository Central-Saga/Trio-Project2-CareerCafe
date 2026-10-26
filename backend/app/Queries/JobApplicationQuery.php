<?php

namespace App\Queries;

use App\Models\Job;
use App\Models\JobApplication;
use Illuminate\Database\Eloquent\Collection;

class JobApplicationQuery
{
    /**
     * Ambil daftar lamaran milik pengguna beserta ringkasan lowongan.
     */
    public function forUser(int $userId): Collection
    {
        return JobApplication::query()
            ->with([
                'job:id,title,company,location,type,category,salary',
            ])
            ->where('user_id', $userId)
            ->orderByDesc('applied_at')
            ->orderByDesc('id')
            ->get();
    }

    /**
     * Ambil lowongan yang masih aktif.
     */
    public function findActiveJob(int $jobId): ?Job
    {
        return Job::query()
            ->where('is_active', true)
            ->find($jobId);
    }

    /**
     * Periksa apakah pengguna pernah melamar lowongan ini.
     */
    public function hasApplied(int $jobId, int $userId): bool
    {
        return JobApplication::query()
            ->where('job_id', $jobId)
            ->where('user_id', $userId)
            ->exists();
    }
}
