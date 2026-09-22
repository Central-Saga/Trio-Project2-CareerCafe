<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->foreignId('industry_id')->nullable()->constrained('industries')->nullOnDelete();
            $table->string('profile_photo')->nullable();
            $table->text('bio')->nullable();
            $table->string('location')->nullable();
            $table->string('job_title')->nullable();
            $table->string('company')->nullable();
            $table->integer('experience_years')->nullable()->default(0);
            $table->string('education')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('timezone')->default('Asia/Jakarta');
            $table->decimal('avg_rating', 3, 2)->default(0.00);
            $table->integer('total_reviews')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
