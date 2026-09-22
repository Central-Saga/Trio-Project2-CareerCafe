<?php

namespace App\Console\Commands;

use App\Http\Controllers\SlotController;
use App\Models\User;
use Illuminate\Console\Command;

class GenerateBookedSlots extends Command
{
    protected $signature = 'slots:generate {--weeks=4 : Jumlah minggu ke depan untuk generate slot}';
    protected $description = 'Generate slot konkret 2-4 minggu ke depan dari template availabilities (PRD Section 23)';

    public function handle()
    {
        $weeks = (int) $this->option('weeks');
        $slotController = new SlotController();

        $mentors = User::where('role', 'mentor')->where('status', 'active')->get();
        $this->info("Men-generate slot konkret untuk {$mentors->count()} mentor selama {$weeks} minggu...");

        foreach ($mentors as $mentor) {
            $slotController->generateConcreteSlotsForMentor($mentor->id, $weeks);
            $this->line("  -> Mentor [{$mentor->name}] selesai.");
        }

        $this->info('Semua slot berhasil di-generate.');
        return Command::SUCCESS;
    }
}
