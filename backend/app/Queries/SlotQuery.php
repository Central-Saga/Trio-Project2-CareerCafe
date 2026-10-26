<?php

namespace App\Queries;

use App\Models\Availability;
use App\Models\BookedSlot;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class SlotQuery
{
    /**
     * Mengambil mentor berdasarkan ID dan role.
     */
    public function findMentor(int $mentorId): ?User
    {
        return User::query()
            ->where('role', 'mentor')
            ->find($mentorId);
    }

    /**
     * Mengambil template ketersediaan aktif milik mentor.
     */
    public function getAvailability(int $mentorId): Collection
    {
        return Availability::query()
            ->where('mentor_id', $mentorId)
            ->where('is_active', true)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Mengambil slot yang tersedia pada rentang tanggal tertentu.
     */
    public function getAvailableSlots(
        int $mentorId,
        string $fromDate,
        string $toDate
    ): Collection {
        return BookedSlot::query()
            ->where('mentor_id', $mentorId)
            ->whereBetween('date', [$fromDate, $toDate])
            ->where('status', 'available')
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();
    }
}