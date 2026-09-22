<?php

namespace App\Http\Controllers;

use App\Models\BookedSlot;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SessionController extends Controller
{
    /**
     * List sessions for the authenticated user (PRD FR-12, Section 30.5).
     * Filterable by status (pending, approved, completed, cancelled, expired) or tab.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Session::with([
            'mentor:id,name,email',
            'mentor.profile:id,user_id,profile_photo,job_title,company,timezone',
            'mentee:id,name,email',
            'mentee.profile:id,user_id,profile_photo,timezone',
            'bookedSlot',
            'feedback',
        ]);

        if ($user->role === 'mentor') {
            $query->where('mentor_id', $user->id);
        } else {
            $query->where('mentee_id', $user->id);
        }

        // Filter tab: upcoming, completed, cancelled, pending
        if ($request->filled('tab')) {
            $tab = $request->tab;
            if ($tab === 'upcoming') {
                $query->where('status', 'approved');
            } elseif ($tab === 'pending') {
                $query->where('status', 'pending');
            } elseif ($tab === 'completed') {
                $query->where('status', 'completed');
            } elseif ($tab === 'cancelled') {
                $query->whereIn('status', ['cancelled', 'rejected', 'expired']);
            }
        } elseif ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = (int) $request->input('per_page', 20);
        $sessions = $query->latest('id')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar sesi berhasil diambil.',
            'data' => $sessions->items(),
            'pagination' => [
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
                'per_page' => $sessions->perPage(),
                'total' => $sessions->total(),
            ],
        ]);
    }

    /**
     * Show single session detail (PRD FR-11).
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $session = Session::with([
            'mentor:id,name,email',
            'mentor.profile',
            'mentee:id,name,email',
            'mentee.profile',
            'bookedSlot',
            'feedback',
        ])->find($id);

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak ditemukan.',
            ], 404);
        }

        // Authorization: Mentor, mentee, or admin
        if ($session->mentor_id !== $user->id && $session->mentee_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke sesi ini.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail sesi berhasil diambil.',
            'data' => $session,
        ]);
    }

    /**
     * Request a coffee chat session with concurrency locking (AC-09, FR-06, FR-09, Section 16 & 17).
     */
    public function store(Request $request)
    {
        $mentee = $request->user();

        $validator = Validator::make($request->all(), [
            'booked_slot_id' => ['required', 'exists:booked_slots,id'],
            'topic' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:2000'],
            'duration' => ['required', 'integer', 'min:15', 'max:120'],
            'meeting_type' => ['required', 'in:online,offline'],
            'meeting_link' => ['nullable', 'string', 'max:255'],
            'meeting_location' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // DB Transaction with pessimistic locking (lockForUpdate) to prevent race condition (AC-09)
            $session = DB::transaction(function () use ($request, $mentee) {
                $slot = BookedSlot::where('id', $request->booked_slot_id)
                    ->lockForUpdate()
                    ->first();

                if (!$slot || $slot->status !== 'available') {
                    throw new \Exception('The selected slot is no longer available.', 409);
                }

                // Business Rule 1: mentor_id != mentee_id (no self-booking)
                if ($slot->mentor_id === $mentee->id) {
                    throw new \Exception('Anda tidak dapat melakukan pemesanan pada diri Anda sendiri.', 422);
                }

                // Lock slot by setting status to pending
                $slot->update(['status' => 'pending']);

                $session = Session::create([
                    'mentor_id' => $slot->mentor_id,
                    'mentee_id' => $mentee->id,
                    'booked_slot_id' => $slot->id,
                    'topic' => $request->topic,
                    'message' => $request->message,
                    'duration' => $request->duration,
                    'meeting_type' => $request->meeting_type,
                    'meeting_link' => $request->meeting_link ?? ($request->meeting_type === 'online' ? 'https://meet.google.com' : null),
                    'meeting_location' => $request->meeting_location,
                    'status' => 'pending',
                ]);

                return $session;
            });

            return response()->json([
                'success' => true,
                'message' => 'Permintaan coffee chat berhasil dikirim ke mentor.',
                'data' => $session->load(['mentor.profile', 'bookedSlot']),
            ], 201);
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => [
                    'booked_slot_id' => [$e->getMessage()],
                ],
            ], $code);
        }
    }

    /**
     * Mentor approves session (PRD FR-07, FR-09).
     */
    public function approve(Request $request, $id)
    {
        $mentor = $request->user();
        $session = Session::with('bookedSlot')->find($id);

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak ditemukan.',
            ], 404);
        }

        // Business Rule 3: Mentor hanya bisa approve/reject request yang ditujukan kepadanya
        if ($session->mentor_id !== $mentor->id) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya mentor yang dituju yang dapat menyetujui sesi.',
            ], 403);
        }

        if ($session->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => "Hanya sesi berstatus 'pending' yang dapat disetujui.",
            ], 422);
        }

        DB::transaction(function () use ($session) {
            $session->update(['status' => 'approved']);
            $session->bookedSlot->update(['status' => 'booked']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Sesi coffee chat telah disetujui.',
            'data' => $session->fresh(['mentor.profile', 'mentee.profile', 'bookedSlot']),
        ]);
    }

    /**
     * Mentor rejects session (PRD FR-07, FR-09).
     */
    public function reject(Request $request, $id)
    {
        $mentor = $request->user();
        $session = Session::with('bookedSlot')->find($id);

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak ditemukan.',
            ], 404);
        }

        if ($session->mentor_id !== $mentor->id) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya mentor yang dituju yang dapat menolak sesi.',
            ], 403);
        }

        if ($session->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => "Hanya sesi berstatus 'pending' yang dapat ditolak.",
            ], 422);
        }

        DB::transaction(function () use ($session) {
            $session->update(['status' => 'rejected']);
            // FR-09 Point 4: Slot kembali menjadi available
            $session->bookedSlot->update(['status' => 'available']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Sesi coffee chat telah ditolak dan slot dikembalikan.',
            'data' => $session->fresh(),
        ]);
    }

    /**
     * Cancel session by mentor or mentee before completed (PRD FR-07).
     */
    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        $session = Session::with('bookedSlot')->find($id);

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak ditemukan.',
            ], 404);
        }

        if ($session->mentor_id !== $user->id && $session->mentee_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk membatalkan sesi ini.',
            ], 403);
        }

        if ($session->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Sesi yang sudah selesai tidak dapat dibatalkan.',
            ], 422);
        }

        DB::transaction(function () use ($session) {
            $session->update(['status' => 'cancelled']);
            // Revert slot status to available
            $session->bookedSlot->update(['status' => 'available']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Sesi coffee chat telah dibatalkan.',
            'data' => $session->fresh(),
        ]);
    }

    /**
     * Complete session by mentor (PRD Section 30.3).
     */
    public function complete(Request $request, $id)
    {
        $user = $request->user();
        $session = Session::find($id);

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak ditemukan.',
            ], 404);
        }

        // Section 30.3: Mentee tidak diberi hak menandai completed; mentor diperbolehkan manual override
        if ($session->mentor_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya mentor pemilik sesi yang berhak menandai sesi selesai.',
            ], 403);
        }

        if ($session->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => "Hanya sesi yang sudah disetujui ('approved') yang dapat diselesaikan.",
            ], 422);
        }

        $session->update(['status' => 'completed']);

        return response()->json([
            'success' => true,
            'message' => 'Sesi coffee chat telah berhasil diselesaikan.',
            'data' => $session->fresh(['mentor.profile', 'mentee.profile', 'bookedSlot']),
        ]);
    }
}
