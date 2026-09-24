<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();

            // Pekerjaan yang dilamar
            $table->foreignId('job_id')
                ->constrained('jobs')
                ->cascadeOnDelete();

            // User yang melamar
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Snapshot data pelamar saat melamar
            $table->string('full_name');
            $table->string('email');
            $table->string('phone')->nullable();

            // File CV
            $table->string('cv_path')->nullable();

            // Surat lamaran
            $table->text('cover_letter')->nullable();

            // Link portfolio
            $table->string('portfolio_url')->nullable();

            // Status lamaran
            $table->string('status')->default('pending');

            // Waktu melamar
            $table->timestamp('applied_at')->nullable();

            $table->timestamps();

            // Satu user hanya boleh melamar satu kali
            // untuk pekerjaan yang sama.
            $table->unique(['job_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};