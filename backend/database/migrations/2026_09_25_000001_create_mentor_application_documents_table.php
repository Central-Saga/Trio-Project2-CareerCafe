<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Jalankan migration.
     */
    public function up(): void
    {
        Schema::create('mentor_application_documents', function (Blueprint $table) {
            $table->id();

            /*
             * Relasi ke tabel mentor_applications.
             *
             * Kalau sebuah pengajuan mentor dihapus,
             * seluruh dokumen miliknya juga ikut terhapus.
             */
            $table->foreignId('mentor_application_id')
                ->constrained('mentor_applications')
                ->cascadeOnDelete();

            /*
             * Jenis dokumen:
             *
             * certificate
             * work_experience
             * portfolio
             * other
             */
            $table->string('document_type', 40);

            /*
             * Nama asli file yang diupload user.
             * Contoh:
             * "sertifikat-aws.pdf"
             */
            $table->string('original_name', 255);

            /*
             * Lokasi file di private/local storage.
             */
            $table->string('file_path', 500);

            /*
             * MIME type file.
             * Contoh:
             * application/pdf
             * image/jpeg
             * image/png
             */
            $table->string('mime_type', 100);

            /*
             * Ukuran file dalam bytes.
             */
            $table->unsignedBigInteger('file_size');

            $table->timestamps();

            /*
             * Index untuk mempercepat pencarian dokumen
             * berdasarkan aplikasi dan jenis dokumen.
             */
            $table->index([
                'mentor_application_id',
                'document_type',
            ]);
        });
    }

    /**
     * Rollback migration.
     */
    public function down(): void
    {
        Schema::dropIfExists(
            'mentor_application_documents'
        );
    }
};