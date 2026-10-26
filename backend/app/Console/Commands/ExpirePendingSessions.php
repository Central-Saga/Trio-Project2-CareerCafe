<?php

namespace App\Console\Commands;

use App\Models\Session;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExpirePendingSessions extends Command
{
    protected $signature = 'sessions:expire';

    protected $description = 'Ubah request sesi pending > 48 jam menjadi expired dan kembalikan slot ke available (PRD Section 30.1)';

    public function handle(): int
    {
        $cutoff = Carbon::now('UTC')->subHours(48);

        $expiredCount = 0;

        Session::query()
            ->where('status', 'pending')
            ->where('created_at', '<', $cutoff)
            ->select('id')
            ->chunkById(100, function ($sessions) use ($cutoff, &$expiredCount): void {
                foreach ($sessions as $candidate) {
                    $expired = DB::transaction(function () use ($candidate, $cutoff): bool {
                        $session = Session::query()
                            ->whereKey($candidate->id)
                            ->where('status', 'pending')
                            ->where('created_at', '<', $cutoff)
                            ->lockForUpdate()
                            ->first();

                        if (! $session) {
                            return false;
                        }

                        $slot = $session->bookedSlot()
                            ->lockForUpdate()
                            ->first();

                        $session->update(['status' => 'expired']);

                        if ($slot?->status === 'pending') {
                            $slot->update(['status' => 'available']);
                        }

                        return true;
                    });

                    if ($expired) {
                        $expiredCount++;
                        $this->line("  -> Sesi ID #{$candidate->id} diubah ke 'expired'.");
                    }
                }
            });

        $this->info("Memproses {$expiredCount} sesi pending yang melebihi batas 48 jam.");
        $this->info('Pemeriksaan selesai.');

        return Command::SUCCESS;
    }
}
