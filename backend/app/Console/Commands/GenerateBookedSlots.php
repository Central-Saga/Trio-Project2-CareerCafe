<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\SlotService;
use Illuminate\Console\Command;

class GenerateBookedSlots extends Command
{
    protected $signature = 'slots:generate {--weeks=4 : Jumlah minggu ke depan untuk generate slot}';

    protected $description = 'Generate slot konkret 2-4 minggu ke depan dari template availabilities (PRD Section 23)';

    public function handle(SlotService $slotService): int
    {
        $weeks = filter_var($this->option('weeks'), FILTER_VALIDATE_INT);

        if ($weeks === false || $weeks < 1) {
            $this->error('Opsi --weeks harus berupa bilangan bulat positif.');

            return Command::FAILURE;
        }

        $mentorCount = 0;

        User::query()
            ->where('role', 'mentor')
            ->where('status', 'active')
            ->chunkById(100, function ($mentors) use (
                $slotService,
                $weeks,
                &$mentorCount
            ): void {
                foreach ($mentors as $mentor) {
                    $slotService->generateConcreteSlotsForMentor(
                        (int) $mentor->id,
                        $weeks,
                    );
                    $mentorCount++;
                    $this->line("  -> Mentor [{$mentor->name}] selesai.");
                }
            });

        $this->info("Slot berhasil di-generate untuk {$mentorCount} mentor selama {$weeks} minggu.");

        return Command::SUCCESS;
    }
}
