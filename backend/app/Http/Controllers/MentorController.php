<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class MentorController extends Controller
{
    /**
     * Get list of mentors with search and filters (PRD FR-04, FR-05, Section 30.5).
     */
    public function index(Request $request)
    {
        $query = User::with(['profile.industry', 'skills'])
            ->where('role', 'mentor')
            ->where('status', 'active');

        // Search: nama, job_title, company, industry, skills
        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
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

        // Filter: Industry (by id or name)
        if ($request->filled('industry')) {
            $industry = $request->industry;
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

        // Filter: Skill (by id or name)
        if ($request->filled('skill')) {
            $skill = $request->skill;
            $query->whereHas('skills', function ($sq) use ($skill) {
                if (is_numeric($skill)) {
                    $sq->where('skills.id', $skill);
                } else {
                    $sq->where('skills.name', 'ilike', '%' . $skill . '%');
                }
            });
        }

        // Filter: Experience range (min_exp, max_exp)
        if ($request->filled('min_exp')) {
            $minExp = (int) $request->min_exp;
            $query->whereHas('profile', function ($pq) use ($minExp) {
                $pq->where('experience_years', '>=', $minExp);
            });
        }
        if ($request->filled('max_exp')) {
            $maxExp = (int) $request->max_exp;
            $query->whereHas('profile', function ($pq) use ($maxExp) {
                $pq->where('experience_years', '<=', $maxExp);
            });
        }

        // Eager load completed session counts for each mentor
        $query->withCount([
            'mentorSessions as completed_sessions_count' => function ($sq) {
                $sq->where('status', 'completed');
            }
        ]);

        // Default pagination: 15 items per page (PRD Section 30.5)
        $perPage = (int) $request->input('per_page', 15);
        $mentors = $query->latest('id')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar mentor berhasil diambil.',
            'data' => $mentors->items(),
            'pagination' => [
                'current_page' => $mentors->currentPage(),
                'last_page' => $mentors->lastPage(),
                'per_page' => $mentors->perPage(),
                'total' => $mentors->total(),
            ],
        ]);
    }

    /**
     * Get mentor detail profile (PRD FR-03).
     */
    public function show($id)
    {
        $mentor = User::with([
            'profile.industry',
            'skills',
            'availabilities' => function ($q) {
                $q->where('is_active', true)->orderBy('day_of_week')->orderBy('start_time');
            },
            'mentorFeedbacks.mentee:id,name',
        ])
        ->withCount([
            'mentorSessions as completed_sessions_count' => function ($sq) {
                $sq->where('status', 'completed');
            }
        ])
        ->where('role', 'mentor')
        ->where('status', 'active')
        ->find($id);

        if (!$mentor) {
            return response()->json([
                'success' => false,
                'message' => 'Mentor tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail profil mentor berhasil diambil.',
            'data' => $mentor,
        ]);
    }
}