<?php

namespace App\Services;

use App\Models\Availability;
use App\Models\BookedSlot;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SlotService
{
    /**
     * Mengganti template ketersediaan mentor dan menghasilkan slot
     * konkret untuk empat minggu ke depan.
     *
     * @param array<string, mixed> $validated
     */
    public function setAvailability(
        User $mentor,
        array $validated
    ): Collection {
        return DB::transaction(function () use ($mentor, $validated) {
            Availability::query()
                ->where('mentor_id', $mentor->id)
                ->delete();

            $createdTemplates = collect();

            foreach ($validated['availabilities'] as $slot) {
                $createdTemplates->push(
                    Availability::query()->create([
                        'mentor_id' => $mentor->id,
                        'day_of_week' => $slot['day_of_week'],
                        'start_time' => $slot['start_time'],
                        'end_time' => $slot['end_time'],
                        'is_active' => true,
                    ])
                );
            }

            $this->generateConcreteSlotsForMentor(
                (int) $mentor->id,
                4
            );

            return $createdTemplates;
        });
    }

    /**
     * Menghasilkan slot konkret berdurasi 45 menit dari template aktif.
     */
    public function generateConcreteSlotsForMentor(
        int $mentorId,
        int $weeks = 4
    ): void {
        $templates = Availability::query()
            ->where('mentor_id', $mentorId)
            ->where('is_active', true)
            ->get();

        if ($templates->isEmpty()) {
            return;
        }

        $startDate = Carbon::today('UTC');
        $endDate = Carbon::today('UTC')->addWeeks($weeks);

        for (
            $date = $startDate->copy();
            $date->lte($endDate);
            $date->addDay()
        ) {
            $matchingTemplates = $templates->where(
                'day_of_week',
                $date->dayOfWeek
            );

            foreach ($matchingTemplates as $template) {
                $startTime = $this->parseTime($template->start_time);
                $endTime = $this->parseTime($template->end_time);
                $currentStart = $startTime->copy();

                while ($currentStart->lt($endTime)) {
                    $currentEnd = $currentStart->copy()->addMinutes(45);

                    if ($currentEnd->gt($endTime)) {
                        break;
                    }

                    $dateString = $date->toDateString();
                    $startString = $currentStart->format('H:i:s');
                    $endString = $currentEnd->format('H:i:s');

                    $exists = BookedSlot::query()
                        ->where('mentor_id', $mentorId)
                        ->where('date', $dateString)
                        ->where('start_time', $startString)
                        ->exists();

                    if (!$exists) {
                        BookedSlot::query()->create([
                            'mentor_id' => $mentorId,
                            'date' => $dateString,
                            'start_time' => $startString,
                            'end_time' => $endString,
                            'status' => 'available',
                            'availability_id' => $template->id,
                        ]);
                    }

                    $currentStart->addMinutes(45);
                }
            }
        }
    }

    /**
     * Mendukung format waktu H:i maupun H:i:s.
     */
    private function parseTime(string $time): Carbon
    {
        if (strlen($time) === 5) {
            $time .= ':00';
        }

        return Carbon::createFromFormat('!H:i:s', $time, 'UTC');
    }
}