<?php

namespace App\Console\Commands;

use App\Models\Session;
use Carbon\Carbon;
use Illuminate\Console\Command;

class AutoCompleteSessions extends Command
{
    protected $signature = 'sessions:autocomplete';
    protected $description = 'Otomatis selesaikan sesi approved yang waktu end_time slot telah terlewati (PRD Section 30.3)';

    public function handle()
    {
        $now = Carbon::now('UTC');
        $todayStr = $now->toDateString();
        $currentTimeStr = $now->format('H:i:s');

        $sessionsToComplete = Session::where('status', 'approved')
            ->whereHas('bookedSlot', function ($q) use ($todayStr, $currentTimeStr) {
                $q->where('date', '<', $todayStr)
                  ->orWhere(function ($sub) use ($todayStr, $currentTimeStr) {
                      $sub->where('date', '=', $todayStr)
                          ->where('end_time', '<=', $currentTimeStr);
                  });
            })
            ->get();

        $this->info("Menemukan {$sessionsToComplete->count()} sesi approved yang jadwalnya telah terlewati.");

        foreach ($sessionsToComplete as $session) {
            $session->update(['status' => 'completed']);
            $this->line("  -> Sesi ID #{$session->id} otomatis diubah ke 'completed'.");
        }

        $this->info('Auto-complete selesai.');
        return Command::SUCCESS;
    }
}
