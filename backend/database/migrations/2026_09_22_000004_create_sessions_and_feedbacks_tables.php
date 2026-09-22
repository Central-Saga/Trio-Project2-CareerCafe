<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Nama tabel diubah menjadi mentoring_sessions agar tidak bentrok
        Schema::create('mentoring_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mentor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('mentee_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('booked_slot_id')->unique()->constrained('booked_slots')->onDelete('cascade');
            $table->string('topic');
            $table->text('message')->nullable();
            $table->integer('duration')->default(45); // menit
            $table->string('meeting_type')->default('online'); // online, offline
            $table->string('meeting_link')->nullable();
            $table->string('meeting_location')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected, expired, cancelled, completed
            $table->timestamps();
        });

        Schema::create('feedbacks', function (Blueprint $table) {
            $table->id();
            // Referensi constrained diubah menjadi mentoring_sessions
            $table->foreignId('session_id')->unique()->constrained('mentoring_sessions')->onDelete('cascade');
            $table->foreignId('mentor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('mentee_id')->constrained('users')->onDelete('cascade');
            $table->smallInteger('rating'); // 1 - 5
            $table->text('comment')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedbacks');
        // Drop tabel dengan nama yang baru
        Schema::dropIfExists('mentoring_sessions');
    }
};