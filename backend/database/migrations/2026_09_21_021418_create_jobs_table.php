<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('job_listings', function (Blueprint $table) {
    $table->id();
    $table->string('title'); // Judul posisi pekerjaan
    $table->string('company'); // Nama perusahaan
    $table->text('description'); // Deskripsi atau persyaratan
    $table->string('location'); // Lokasi penempatan
    $table->string('salary')->nullable(); // Gaji (opsional)
    $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
