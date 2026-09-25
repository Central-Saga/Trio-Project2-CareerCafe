<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create mentor applications table.
     */
    public function up(): void
    {
        Schema::create('mentor_applications', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | APPLICANT
            |--------------------------------------------------------------------------
            */
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | PROFESSIONAL INFORMATION
            |--------------------------------------------------------------------------
            */
            $table->string('full_name');
            $table->string('job_title');
            $table->string('company')->nullable();
            $table->string('location')->nullable();

            $table->unsignedInteger('experience_years');

            $table->string('education')->nullable();

            $table->foreignId('industry_id')
                ->nullable()
                ->constrained('industries')
                ->nullOnDelete();

            /*
            |--------------------------------------------------------------------------
            | PROFILE
            |--------------------------------------------------------------------------
            */
            $table->text('bio');
            $table->text('motivation');

            $table->string('linkedin_url')->nullable();

            /*
            |--------------------------------------------------------------------------
            | SKILLS
            |--------------------------------------------------------------------------
            |
            | Menyimpan ID skill dalam bentuk JSON sementara.
            | Setelah admin approve, data ini dapat dipindahkan
            | ke tabel mentor_skills.
            |
            */
            $table->json('skills')->nullable();

            /*
            |--------------------------------------------------------------------------
            | APPLICATION STATUS
            |--------------------------------------------------------------------------
            |
            | pending   = menunggu review admin
            | approved  = disetujui admin
            | rejected  = ditolak admin
            |
            */
            $table->string('status')->default('pending');

            /*
            |--------------------------------------------------------------------------
            | ADMIN REVIEW
            |--------------------------------------------------------------------------
            */
            $table->foreignId('reviewed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('rejection_reason')->nullable();

            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | INDEX
            |--------------------------------------------------------------------------
            */
            $table->index('status');
            $table->index('user_id');
            $table->index('industry_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mentor_applications');
    }
};