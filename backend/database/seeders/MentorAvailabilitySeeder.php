<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MentorAvailabilitySeeder extends Seeder
{
    /**
     * Membuat jadwal availability default untuk seluruh mentor Career Cafe.
     */
    public function run(): void
    {
        $mentorEmails = [
            'rian.pratama@careercafe.test',
            'putu.ayu@careercafe.test',
            'gede.hendra@careercafe.test',
            'komang.sinta@careercafe.test',
        ];

        /*
        |----------------------------------------------------------------------
        | Jadwal default
        |----------------------------------------------------------------------
        | 1 = Senin
        | 2 = Selasa
        | 3 = Rabu
        | 4 = Kamis
        | 5 = Jumat
        |
        | Setiap hari:
        | 09:00 - 17:00
        |
        | Slot konkret nantinya otomatis dibuat oleh SlotController
        | dalam interval 45 menit ketika endpoint /slots dipanggil.
        |----------------------------------------------------------------------
        */

        $days = [1, 2, 3, 4, 5];

        foreach ($mentorEmails as $email) {
            $mentor = DB::table('users')
                ->where('email', $email)
                ->where('role', 'mentor')
                ->first();

            if (!$mentor) {
                $this->command?->warn(
                    "Mentor dengan email {$email} tidak ditemukan."
                );

                continue;
            }

            foreach ($days as $dayOfWeek) {
                DB::table('availabilities')->updateOrInsert(
                    [
                        'mentor_id' => $mentor->id,
                        'day_of_week' => $dayOfWeek,
                        'start_time' => '09:00:00',
                        'end_time' => '17:00:00',
                    ],
                    [
                        'is_active' => true,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }

            $this->command?->info(
                "Availability berhasil dibuat untuk {$mentor->name}."
            );
        }

        $this->command?->info('==========================================');
        $this->command?->info('Availability mentor berhasil di-seed.');
        $this->command?->info('Senin - Jumat, pukul 09:00 - 17:00.');
        $this->command?->info('==========================================');
    }
}