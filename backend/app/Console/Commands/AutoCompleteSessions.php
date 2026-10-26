<?php

namespace App\Console\Commands;

use App\Models\Session;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AutoCompleteSessions extends Command
{
    protected $signature = 'sessions:autocomplete';

    protected $description = 'Otomatis selesaikan sesi approved yang waktu end_time slot telah terlewati (PRD Section 30.3)';

    public function handle(): int
    {
        $now = Carbon::now('UTC');
        $todayStr = $now->toDateString();
        $currentTimeStr = $now->format('H:i:s');

        $completedCount = 0;
        $eligibleSessions = Session::query()
            ->where('status', 'approved')
            ->whereHas('bookedSlot', function ($query) use ($todayStr, $currentTimeStr) {
                $query->where('date', '<', $todayStr)
                    ->orWhere(function ($subQuery) use ($todayStr, $currentTimeStr) {
                        $subQuery->where('date', $todayStr)
                            ->where('end_time', '<=', $currentTimeStr);
                    });
            })
            ->select('id');

        $eligibleSessions->chunkById(100, function ($sessions) use (
            $todayStr,
            $currentTimeStr,
            &$completedCount
        ): void {
            foreach ($sessions as $candidate) {
                $completed = DB::transaction(function () use (
                    $candidate,
                    $todayStr,
                    $currentTimeStr
                ): bool {
                    $session = Session::query()
                        ->whereKey($candidate->id)
                        ->where('status', 'approved')
                        ->whereHas('bookedSlot', function ($query) use (
                            $todayStr,
                            $currentTimeStr
                        ) {
                            $query->where('date', '<', $todayStr)
                                ->orWhere(function ($subQuery) use (
                                    $todayStr,
                                    $currentTimeStr
                                ) {
                                    $subQuery->where('date', $todayStr)
                                        ->where('end_time', '<=', $currentTimeStr);
                                });
                        })
                        ->lockForUpdate()
                        ->first();

                    if (! $session) {
                        return false;
                    }

                    $session->update(['status' => 'completed']);

                    return true;
                });

                if ($completed) {
                    $completedCount++;
                    $this->line("  -> Sesi ID #{$candidate->id} otomatis diubah ke 'completed'.");
                }
            }
        });

        $this->info("Memproses {$completedCount} sesi approved yang jadwalnya telah terlewati.");
        $this->info('Auto-complete selesai.');

        return Command::SUCCESS;
    }
}
