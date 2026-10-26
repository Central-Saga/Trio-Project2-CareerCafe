<?php

namespace App\Queries;

use App\Models\Job;
use Illuminate\Database\Eloquent\Collection;

class JobQuery
{
    public function allActive(): Collection
    {
        return Job::query()
            ->where('is_active', true)
            ->orderByDesc('posted_at')
            ->orderByDesc('id')
            ->get();
    }

    public function findActive(int $id): ?Job
    {
        return Job::query()
            ->where('is_active', true)
            ->find($id);
    }
}
