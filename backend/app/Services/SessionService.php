<?php

namespace App\Services;

use App\Models\BookedSlot;
use App\Models\Session;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SessionService
{
    /**
     * Membuat permintaan sesi dan mengunci slot dalam transaksi.
     *
     * @throws RuntimeException
     */
    public function create(User $mentee, array $validated): Session
    {
        return DB::transaction(function () use ($mentee, $validated) {
            $slot = BookedSlot::query()
                ->whereKey($validated['booked_slot_id'])
                ->lockForUpdate()
                ->first();

            if (! $slot || $slot->status !== 'available') {
                throw new RuntimeException(
                    'The selected slot is no longer available.',
                    409
                );
            }

            if ((int) $slot->mentor_id === (int) $mentee->id) {
                throw new RuntimeException(
                    'Anda tidak dapat melakukan pemesanan pada diri Anda sendiri.',
                    422
                );
            }

            $slot->update(['status' => 'pending']);

            return Session::create([
                'mentor_id' => $slot->mentor_id,
                'mentee_id' => $mentee->id,
                'booked_slot_id' => $slot->id,
                'topic' => $validated['topic'],
                'message' => $validated['message'],
                'duration' => $validated['duration'],
                'meeting_type' => $validated['meeting_type'],
                'meeting_link' => $validated['meeting_link']
                    ?? ($validated['meeting_type'] === 'online'
                        ? 'https://meet.google.com'
                        : null),
                'meeting_location' => $validated['meeting_location'] ?? null,
                'status' => 'pending',
            ]);
        });
    }

    /**
     * Menyetujui sesi pending dan mengubah slot menjadi booked.
     *
     * Otorisasi harus diperiksa oleh controller sebelum memanggil metode ini.
     *
     * @throws RuntimeException
     */
    public function approve(int $sessionId): Session
    {
        return DB::transaction(function () use ($sessionId) {
            $session = Session::query()
                ->whereKey($sessionId)
                ->lockForUpdate()
                ->first();

            if (! $session) {
                throw new RuntimeException('Sesi tidak ditemukan.', 404);
            }

            if ($session->status !== 'pending') {
                throw new RuntimeException(
                    "Hanya sesi berstatus 'pending' yang dapat disetujui.",
                    422
                );
            }

            $slot = BookedSlot::query()
                ->whereKey($session->booked_slot_id)
                ->lockForUpdate()
                ->first();

            if (! $slot || $slot->status !== 'pending') {
                throw new RuntimeException(
                    'Slot sesi tidak tersedia untuk disetujui.',
                    409
                );
            }

            $session->update(['status' => 'approved']);
            $slot->update(['status' => 'booked']);

            return $session->fresh([
                'mentor.profile',
                'mentee.profile',
                'bookedSlot',
            ]);
        });
    }

    /**
     * Menolak sesi pending, menyimpan alasan, dan melepaskan slot.
     *
     * @throws RuntimeException
     */
    public function reject(int $sessionId, string $rejectionReason): Session
    {
        return DB::transaction(function () use ($sessionId, $rejectionReason) {
            $session = Session::query()
                ->whereKey($sessionId)
                ->lockForUpdate()
                ->first();

            if (! $session) {
                throw new RuntimeException('Sesi tidak ditemukan.', 404);
            }

            if ($session->status !== 'pending') {
                throw new RuntimeException(
                    "Hanya sesi berstatus 'pending' yang dapat ditolak.",
                    422
                );
            }

            $slot = BookedSlot::query()
                ->whereKey($session->booked_slot_id)
                ->lockForUpdate()
                ->first();

            // Assign secara langsung karena rejection_reason belum
            // termasuk dalam $fillable model Session.
            $session->status = 'rejected';
            $session->rejection_reason = trim($rejectionReason);
            $session->meeting_link = null;
            $session->save();

            if ($slot) {
                $slot->update(['status' => 'available']);
            }

            return $session->fresh([
                'mentor.profile',
                'mentee.profile',
                'bookedSlot',
            ]);
        });
    }

    /**
     * Membatalkan sesi dan melepaskan slot.
     *
     * @throws RuntimeException
     */
    public function cancel(int $sessionId): Session
    {
        return DB::transaction(function () use ($sessionId) {
            $session = Session::query()
                ->whereKey($sessionId)
                ->lockForUpdate()
                ->first();

            if (! $session) {
                throw new RuntimeException('Sesi tidak ditemukan.', 404);
            }

            if ($session->status === 'completed') {
                throw new RuntimeException(
                    'Sesi yang sudah selesai tidak dapat dibatalkan.',
                    422
                );
            }

            $slot = BookedSlot::query()
                ->whereKey($session->booked_slot_id)
                ->lockForUpdate()
                ->first();

            $session->update(['status' => 'cancelled']);

            if ($slot) {
                $slot->update(['status' => 'available']);
            }

            return $session->fresh([
                'mentor.profile',
                'mentee.profile',
                'bookedSlot',
            ]);
        });
    }

    /**
     * Menyelesaikan sesi yang sudah disetujui.
     *
     * @throws RuntimeException
     */
    public function complete(int $sessionId): Session
    {
        return DB::transaction(function () use ($sessionId) {
            $session = Session::query()
                ->whereKey($sessionId)
                ->lockForUpdate()
                ->first();

            if (! $session) {
                throw new RuntimeException('Sesi tidak ditemukan.', 404);
            }

            if ($session->status !== 'approved') {
                throw new RuntimeException(
                    "Hanya sesi yang sudah disetujui ('approved') yang dapat diselesaikan.",
                    422
                );
            }

            $session->update(['status' => 'completed']);

            return $session->fresh([
                'mentor.profile',
                'mentee.profile',
                'bookedSlot',
            ]);
        });
    }
}
