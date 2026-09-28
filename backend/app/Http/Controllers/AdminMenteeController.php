<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMenteeController extends Controller
{
    /**
     * Admin melihat semua mentee.
     */
    public function index(Request $request): JsonResponse
    {
        $adminCheck = $this->ensureAdmin($request);

        if ($adminCheck) {
            return $adminCheck;
        }

        $query = User::query()
            ->where('role', 'mentee')
            ->with([
                'profile:id,user_id,profile_photo,cover_photo,job_title,company,location,experience_years,education,bio,linkedin_url,timezone',
            ])
            ->withCount([
                'menteeSessions as total_sessions_count',
                'menteeSessions as completed_sessions_count' => function ($sessionQuery) {
                    $sessionQuery->where('status', 'completed');
                },
                'menteeSessions as pending_sessions_count' => function ($sessionQuery) {
                    $sessionQuery->where('status', 'pending');
                },
                'menteeSessions as approved_sessions_count' => function ($sessionQuery) {
                    $sessionQuery->where('status', 'approved');
                },
            ])
            ->latest('id');

        /*
         * Search
         */
        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($userQuery) use ($search) {
                $userQuery
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('profile', function ($profileQuery) use ($search) {
                        $profileQuery
                            ->where('job_title', 'like', "%{$search}%")
                            ->orWhere('company', 'like', "%{$search}%")
                            ->orWhere('location', 'like', "%{$search}%");
                    });
            });
        }

        /*
         * Filter status
         */
        if ($request->filled('status')) {
            $status = strtolower(trim((string) $request->input('status')));

            if (!in_array($status, ['active', 'inactive'], true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Status filter tidak valid.',
                ], 422);
            }

            $query->where('status', $status);
        }

        $perPage = (int) $request->input('per_page', 20);

        if ($perPage < 1) {
            $perPage = 20;
        }

        if ($perPage > 100) {
            $perPage = 100;
        }

        $mentees = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar mentee berhasil diambil.',
            'data' => $mentees->items(),
            'pagination' => [
                'current_page' => $mentees->currentPage(),
                'last_page' => $mentees->lastPage(),
                'per_page' => $mentees->perPage(),
                'total' => $mentees->total(),
            ],
        ]);
    }

    /**
     * Admin melihat detail satu mentee.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $adminCheck = $this->ensureAdmin($request);

        if ($adminCheck) {
            return $adminCheck;
        }

        $mentee = User::query()
            ->where('role', 'mentee')
            ->with([
                'profile:id,user_id,profile_photo,cover_photo,job_title,company,location,experience_years,education,bio,linkedin_url,timezone',
            ])
            ->withCount([
                'menteeSessions as total_sessions_count',
                'menteeSessions as completed_sessions_count' => function ($sessionQuery) {
                    $sessionQuery->where('status', 'completed');
                },
                'menteeSessions as pending_sessions_count' => function ($sessionQuery) {
                    $sessionQuery->where('status', 'pending');
                },
                'menteeSessions as approved_sessions_count' => function ($sessionQuery) {
                    $sessionQuery->where('status', 'approved');
                },
            ])
            ->find($id);

        if (!$mentee) {
            return response()->json([
                'success' => false,
                'message' => 'Mentee tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail mentee berhasil diambil.',
            'data' => $mentee,
        ]);
    }

    /**
     * Pastikan hanya admin yang bisa mengakses endpoint.
     */
    private function ensureAdmin(Request $request): ?JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Akses hanya tersedia untuk admin.',
            ], 403);
        }

        return null;
    }
}
