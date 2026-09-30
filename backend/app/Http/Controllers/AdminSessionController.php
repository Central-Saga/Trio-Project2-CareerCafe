<?php

namespace App\Http\Controllers;

use App\Models\Session;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSessionController extends Controller
{
    /**
     * List seluruh mentoring sessions untuk Admin.
     */
    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $query = Session::query()
            ->with([
                'mentor:id,name,email',
                'mentor.profile:id,user_id,profile_photo,job_title,company,location,timezone',
                'mentee:id,name,email',
                'mentee.profile:id,user_id,profile_photo,job_title,company,location,timezone',
                'bookedSlot',
                'feedback',
            ]);

        /*
         * SEARCH
         * Mencari berdasarkan:
         * - topic
         * - message
         * - nama/email mentor
         * - nama/email mentee
         */
        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            if ($search !== '') {
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('topic', 'ilike', "%{$search}%")
                        ->orWhere('message', 'ilike', "%{$search}%")
                        ->orWhereHas('mentor', function ($mentorQuery) use ($search) {
                            $mentorQuery
                                ->where('name', 'ilike', "%{$search}%")
                                ->orWhere('email', 'ilike', "%{$search}%");
                        })
                        ->orWhereHas('mentee', function ($menteeQuery) use ($search) {
                            $menteeQuery
                                ->where('name', 'ilike', "%{$search}%")
                                ->orWhere('email', 'ilike', "%{$search}%");
                        });
                });
            }
        }

        /*
         * STATUS FILTER
         */
        if ($request->filled('status')) {
            $status = strtolower((string) $request->input('status'));

            if ($status === 'cancelled') {
                $query->whereIn('status', [
                    'cancelled',
                    'rejected',
                    'expired',
                ]);
            } elseif (in_array($status, [
                'pending',
                'approved',
                'completed',
                'rejected',
                'expired',
            ], true)) {
                $query->where('status', $status);
            }
        }

        /*
         * OVERALL SUMMARY
         *
         * Statistik dihitung dari seluruh sessions,
         * bukan hasil filter pencarian.
         */
        $stats = [
            'total' => Session::query()->count(),
            'pending' => Session::query()
                ->where('status', 'pending')
                ->count(),
            'approved' => Session::query()
                ->where('status', 'approved')
                ->count(),
            'completed' => Session::query()
                ->where('status', 'completed')
                ->count(),
            'cancelled' => Session::query()
                ->whereIn('status', [
                    'cancelled',
                    'rejected',
                    'expired',
                ])
                ->count(),
        ];

        /*
         * PAGINATION
         */
        $perPage = (int) $request->input('per_page', 20);

        $perPage = max(1, min($perPage, 100));

        $sessions = $query
            ->latest('id')
            ->paginate($perPage);

        /*
         * Paksa rejection_reason ikut dikirim.
         */
        $items = collect($sessions->items())
            ->map(function ($session) {
                $payload = $session->toArray();

                $payload['rejection_reason'] = $session->getAttribute(
                    'rejection_reason'
                );

                return $payload;
            })
            ->values()
            ->all();

        return response()->json([
            'success' => true,
            'message' => 'Daftar session admin berhasil diambil.',
            'data' => $items,
            'stats' => $stats,
            'pagination' => [
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
                'per_page' => $sessions->perPage(),
                'total' => $sessions->total(),
            ],
        ]);
    }

    /**
     * Detail satu session untuk Admin.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request);

        $session = Session::query()
            ->with([
                'mentor:id,name,email',
                'mentor.profile',
                'mentee:id,name,email',
                'mentee.profile',
                'bookedSlot',
                'feedback',
            ])
            ->find($id);

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Session tidak ditemukan.',
            ], 404);
        }

        $payload = $session->toArray();

        $payload['rejection_reason'] = $session->getAttribute(
            'rejection_reason'
        );

        return response()->json([
            'success' => true,
            'message' => 'Detail session berhasil diambil.',
            'data' => $payload,
        ]);
    }

    /**
     * Admin menandai session approved menjadi completed.
     */
    public function complete(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request);

        $session = Session::query()
            ->with([
                'mentor.profile',
                'mentee.profile',
                'bookedSlot',
                'feedback',
            ])
            ->find($id);

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Session tidak ditemukan.',
            ], 404);
        }

        if ($session->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => "Hanya session berstatus 'approved' yang dapat ditandai selesai.",
            ], 422);
        }

        $session->update([
            'status' => 'completed',
        ]);

        $freshSession = $session->fresh([
            'mentor.profile',
            'mentee.profile',
            'bookedSlot',
            'feedback',
        ]);

        $payload = $freshSession->toArray();

        $payload['rejection_reason'] = $freshSession->getAttribute(
            'rejection_reason'
        );

        return response()->json([
            'success' => true,
            'message' => 'Session berhasil ditandai sebagai selesai.',
            'data' => $payload,
        ]);
    }

    /**
     * Pastikan endpoint hanya dapat digunakan Admin.
     */
    private function ensureAdmin(Request $request): void
    {
        $user = $request->user();

        if (!$user || !$user->isAdmin()) {
            abort(response()->json([
                'success' => false,
                'message' => 'Hanya admin yang dapat mengakses fitur ini.',
            ], 403));
        }
    }
}
