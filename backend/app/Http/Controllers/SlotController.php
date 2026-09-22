<?php

namespace App\Http\Controllers;

use App\Models\Availability;
use App\Models\BookedSlot;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SlotController extends Controller
{
    /**
     * Get weekly availability template of a mentor (PRD FR-08).
     */
    public function getAvailability($mentorId)
    {
        $mentor = User::where('role', 'mentor')->find($mentorId);

        if (!$mentor) {
            return response()->json([
                'success' => false,
                'message' => 'Mentor tidak ditemukan.',
            ], 404);
        }

        $availabilities = Availability::where('mentor_id', $mentorId)
            ->where('is_active', true)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Pola ketersediaan mingguan mentor berhasil diambil.',
            'data' => $availabilities,
        ]);
    }

    /**
     * Set weekly availability template for authenticated mentor (PRD FR-08).
     */
    public function setAvailability(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'mentor') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya mentor yang dapat mengatur ketersediaan.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'availabilities' => ['required', 'array'],
            'availabilities.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'availabilities.*.start_time' => ['required', 'date_format:H:i'],
            'availabilities.*.end_time' => ['required', 'date_format:H:i', 'after:availabilities.*.start_time'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Format ketersediaan mingguan tidak valid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Hapus template ketersediaan lama mentor
        Availability::where('mentor_id', $user->id)->delete();

        $createdTemplates = [];
        foreach ($request->availabilities as $slot) {
            $template = Availability::create([
                'mentor_id' => $user->id,
                'day_of_week' => $slot['day_of_week'],
                'start_time' => $slot['start_time'],
                'end_time' => $slot['end_time'],
                'is_active' => true,
            ]);
            $createdTemplates[] = $template;
        }

        // Otomatis generate slot konkret untuk 4 minggu ke depan
        $this->generateConcreteSlotsForMentor($user->id, 4);

        return response()->json([
            'success' => true,
            'message' => 'Pola ketersediaan berhasil disimpan dan slot konkret telah dibuat.',
            'data' => $createdTemplates,
        ]);
    }

    /**
     * Get concrete slots for a mentor (PRD FR-09).
     * Endpoint: GET /api/mentors/{id}/slots?from=&to=
     */
    public function getSlots(Request $request, $mentorId)
    {
        $mentor = User::where('role', 'mentor')->find($mentorId);

        if (!$mentor) {
            return response()->json([
                'success' => false,
                'message' => 'Mentor tidak ditemukan.',
            ], 404);
        }

        $fromDate = $request->query('from', Carbon::today('UTC')->toDateString());
        $toDate = $request->query('to', Carbon::today('UTC')->addWeeks(4)->toDateString());

        // Pastikan slot sudah ter-generate untuk rentang ini
        $this->generateConcreteSlotsForMentor($mentorId, 4);

        $slots = BookedSlot::where('mentor_id', $mentorId)
            ->whereBetween('date', [$fromDate, $toDate])
            ->where('status', 'available')
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar slot konkret yang tersedia berhasil diambil.',
            'data' => $slots,
        ]);
    }

    /**
     * Helper to generate concrete slots for next $weeks weeks from weekly template.
     */
    public function generateConcreteSlotsForMentor($mentorId, int $weeks = 4)
    {
        $templates = Availability::where('mentor_id', $mentorId)
            ->where('is_active', true)
            ->get();

        if ($templates->isEmpty()) {
            return;
        }

        $startDate = Carbon::today('UTC');
        $endDate = Carbon::today('UTC')->addWeeks($weeks);

        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            $dayOfWeek = $date->dayOfWeek; // 0=Sunday, 1=Monday...

            $matchingTemplates = $templates->where('day_of_week', $dayOfWeek);

            foreach ($matchingTemplates as $tpl) {
                // Konversi template waktu ke slot konkret 45 menit / 1 jam
                $startTime = Carbon::createFromFormat('H:i:s', strlen($tpl->start_time) === 5 ? $tpl->start_time . ':00' : $tpl->start_time, 'UTC');
                $endTime = Carbon::createFromFormat('H:i:s', strlen($tpl->end_time) === 5 ? $tpl->end_time . ':00' : $tpl->end_time, 'UTC');

                $currentStart = $startTime->copy();

                while ($currentStart->lt($endTime)) {
                    $currentEnd = $currentStart->copy()->addMinutes(45);
                    if ($currentEnd->gt($endTime)) {
                        break;
                    }

                    $slotStartStr = $currentStart->format('H:i:s');
                    $slotEndStr = $currentEnd->format('H:i:s');
                    $dateStr = $date->toDateString();

                    // Cek jika slot belum pernah dibuat
                    $exists = BookedSlot::where('mentor_id', $mentorId)
                        ->where('date', $dateStr)
                        ->where('start_time', $slotStartStr)
                        ->exists();

                    if (!$exists) {
                        BookedSlot::create([
                            'mentor_id' => $mentorId,
                            'date' => $dateStr,
                            'start_time' => $slotStartStr,
                            'end_time' => $slotEndStr,
                            'status' => 'available',
                            'availability_id' => $tpl->id,
                        ]);
                    }

                    $currentStart->addMinutes(45);
                }
            }
        }
    }
}
