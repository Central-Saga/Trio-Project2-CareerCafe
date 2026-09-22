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

    public function handle()
    {
        $cutoff = Carbon::now('UTC')->subHours(48);

        $expiredSessions = Session::with('bookedSlot')
            ->where('status', 'pending')
            ->where('created_at', '<', $cutoff)
            ->get();

        $this->info("Menemukan {$expiredSessions->count()} sesi pending yang melebihi batas 48 jam.");

        foreach ($expiredSessions as $session) {
            DB::transaction(function () use ($session) {
                $session->update(['status' => 'expired']);
                if ($session->bookedSlot) {
                    $session->bookedSlot->update(['status' => 'available']);
                }
            });
            $this->line("  -> Sesi ID #{$session->id} diubah ke 'expired' dan slot dibebaskan.");
        }

        $this->info('Pemeriksaan selesai.');
        return Command::SUCCESS;
    }
}
