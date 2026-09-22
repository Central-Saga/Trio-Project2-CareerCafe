<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mentor_id')->constrained('users')->onDelete('cascade');
            $table->tinyInteger('day_of_week'); // 0=Minggu, 1=Senin, ..., 6=Sabtu
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('booked_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mentor_id')->constrained('users')->onDelete('cascade');
            $table->date('date');
            $table->time('start_time'); // UTC
            $table->time('end_time'); // UTC
            $table->string('status')->default('available'); // available, pending, booked
            $table->foreignId('availability_id')->nullable()->constrained('availabilities')->nullOnDelete();
            $table->timestamps();

            $table->unique(['mentor_id', 'date', 'start_time']);
            $table->index(['mentor_id', 'date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booked_slots');
        Schema::dropIfExists('availabilities');
    }
};
