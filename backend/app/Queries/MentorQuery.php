<?php

namespace App\Queries;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class MentorQuery
{
    /**
     * Mendapatkan daftar mentor aktif dengan pencarian dan filter.
     */
    public function paginate(Request $request): LengthAwarePaginator
    {
        $query = User::with(['profile.industry', 'skills'])
            ->where('role', 'mentor')
            ->where('status', 'active');

        if ($request->filled('search')) {
            $search = '%' . trim($request->input('search')) . '%';

            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', $search)
                    ->orWhereHas('profile', function ($pq) use ($search) {
                        $pq->where('job_title', 'ilike', $search)
                            ->orWhere('company', 'ilike', $search)
                            ->orWhere('bio', 'ilike', $search)
                            ->orWhereHas('industry', function ($iq) use ($search) {
                                $iq->where('name', 'ilike', $search);
                            });
                    })
                    ->orWhereHas('skills', function ($sq) use ($search) {
                        $sq->where('name', 'ilike', $search);
                    });
            });
        }

        if ($request->filled('industry')) {
            $industry = $request->input('industry');

            $query->whereHas('profile', function ($pq) use ($industry) {
                if (is_numeric($industry)) {
                    $pq->where('industry_id', $industry);
                } else {
                    $pq->whereHas('industry', function ($iq) use ($industry) {
                        $iq->where('name', 'ilike', '%' . $industry . '%');
                    });
                }
            });
        }

        if ($request->filled('skill')) {
            $skill = $request->input('skill');

            $query->whereHas('skills', function ($sq) use ($skill) {
                if (is_numeric($skill)) {
                    $sq->where('skills.id', $skill);
                } else {
                    $sq->where('skills.name', 'ilike', '%' . $skill . '%');
                }
            });
        }

        if ($request->filled('min_exp')) {
            $minExp = (int) $request->input('min_exp');

            $query->whereHas('profile', function ($pq) use ($minExp) {
                $pq->where('experience_years', '>=', $minExp);
            });
        }

        if ($request->filled('max_exp')) {
            $maxExp = (int) $request->input('max_exp');

            $query->whereHas('profile', function ($pq) use ($maxExp) {
                $pq->where('experience_years', '<=', $maxExp);
            });
        }

        $query->withCount([
            'mentorSessions as completed_sessions_count' => function ($sq) {
                $sq->where('status', 'completed');
            },
        ]);

        $perPage = \App\Support\ApiPagination::perPage($request, 15);

        return $query->latest('id')->paginate($perPage);
    }

    /**
     * Mendapatkan detail mentor aktif beserta relasi yang diperlukan.
     */
    public function findActiveMentor(int|string $id): ?User
    {
        return User::with([
            'profile.industry',
            'skills',
            'availabilities' => function ($q) {
                $q->where('is_active', true)
                    ->orderBy('day_of_week')
                    ->orderBy('start_time');
            },
            'mentorFeedbacks.mentee:id,name',
        ])
            ->withCount([
                'mentorSessions as completed_sessions_count' => function ($sq) {
                    $sq->where('status', 'completed');
                },
            ])
            ->where('role', 'mentor')
            ->where('status', 'active')
            ->find($id);
    }
}
