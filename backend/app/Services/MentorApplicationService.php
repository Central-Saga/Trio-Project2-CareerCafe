<?php

namespace App\Services;

use App\Models\MentorApplication;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class MentorApplicationService
{
    /**
     * Membuat pengajuan mentor dan menyimpan dokumen verifikasi.
     *
     * File disimpan pada local/private storage, bukan public storage.
     *
     * @param array<string, mixed> $validated
     */
    public function submit(int $userId, array $validated): MentorApplication
    {
        $documents = $validated['documents'] ?? [];
        $documentTypes = $validated['document_types'] ?? [];

        unset($validated['documents'], $validated['document_types']);

        $storedPaths = [];

        try {
            $application = DB::transaction(function () use (
                $userId,
                $validated,
                $documents,
                $documentTypes,
                &$storedPaths
            ): MentorApplication {
                $application = MentorApplication::query()->create([
                    'user_id' => $userId,
                    'full_name' => trim($validated['full_name']),
                    'job_title' => trim($validated['job_title']),
                    'company' => $this->nullableTrim(
                        $validated['company'] ?? null
                    ),
                    'location' => $this->nullableTrim(
                        $validated['location'] ?? null
                    ),
                    'experience_years' => (int) $validated['experience_years'],
                    'education' => $this->nullableTrim(
                        $validated['education'] ?? null
                    ),
                    'industry_id' => $validated['industry_id'] ?? null,
                    'bio' => trim($validated['bio']),
                    'motivation' => trim($validated['motivation']),
                    'linkedin_url' => $this->nullableTrim(
                        $validated['linkedin_url'] ?? null
                    ),
                    'skills' => $validated['skills'] ?? [],
                    'status' => 'pending',
                    'reviewed_by' => null,
                    'rejection_reason' => null,
                    'reviewed_at' => null,
                ]);

                foreach ($documents as $index => $file) {
                    $path = $file->store(
                        "mentor-applications/{$application->id}",
                        'local'
                    );

                    if (!$path) {
                        throw new RuntimeException(
                            'Gagal menyimpan dokumen verifikasi.'
                        );
                    }

                    // Catat segera agar file dapat dibersihkan jika transaksi gagal.
                    $storedPaths[] = $path;

                    $application->documents()->create([
                        'document_type' => $documentTypes[$index],
                        'original_name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'mime_type' => $file->getClientMimeType()
                            ?: $file->getMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }

                return $application;
            });

            // Muat relasi yang dibutuhkan resource setelah transaksi selesai.
            return $application->load([
                'industry:id,name',
                'documents:id,mentor_application_id,document_type,original_name,mime_type,file_size,created_at',
            ]);
        } catch (Throwable $exception) {
            // Transaksi database tidak menghapus file fisik secara otomatis.
            foreach ($storedPaths as $storedPath) {
                try {
                    Storage::disk('local')->delete($storedPath);
                } catch (Throwable $cleanupException) {
                    report($cleanupException);
                }
            }

            throw $exception;
        }
    }

    /**
     * Mengubah string opsional menjadi null apabila kosong.
     */
    private function nullableTrim(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }

    /**
     * Menyetujui pengajuan mentor dan mengaktifkan akun pemohon.
     *
     * @throws RuntimeException
     */
    public function approve(
        int $applicationId,
        int $reviewerId
    ): MentorApplication {
        return DB::transaction(function () use (
            $applicationId,
            $reviewerId
        ) {
            $application = MentorApplication::query()
                ->whereKey($applicationId)
                ->lockForUpdate()
                ->first();

            if (!$application) {
                throw new RuntimeException(
                    'Pengajuan mentor tidak ditemukan.',
                    404
                );
            }

            if ($application->status !== 'pending') {
                throw new RuntimeException(
                    'Hanya pengajuan berstatus pending yang dapat disetujui.',
                    422
                );
            }

            $user = User::query()
                ->whereKey($application->user_id)
                ->lockForUpdate()
                ->first();

            if (!$user) {
                throw new RuntimeException(
                    'User pemohon tidak ditemukan.',
                    404
                );
            }

            $user->update([
                'name' => $application->full_name,
                'role' => 'mentor',
                'status' => 'active',
            ]);

            Profile::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'industry_id' => $application->industry_id,
                    'bio' => $application->bio,
                    'location' => $application->location,
                    'job_title' => $application->job_title,
                    'company' => $application->company,
                    'experience_years' => $application->experience_years,
                    'education' => $application->education,
                    'linkedin_url' => $application->linkedin_url,
                    'timezone' => 'Asia/Jakarta',
                ]
            );

            $skills = collect($application->skills ?? [])
                ->map(fn ($skillId) => (int) $skillId)
                ->filter(fn ($skillId) => $skillId > 0)
                ->unique()
                ->values()
                ->all();

            $user->skills()->sync($skills);

            $application->update([
                'status' => 'approved',
                'reviewed_by' => $reviewerId,
                'reviewed_at' => now(),
                'rejection_reason' => null,
            ]);

            return $application->fresh([
                'user:id,name,email,role,status',
                'industry',
                'reviewer:id,name,email',
                'documents',
            ]);
        });
    }

    /**
     * Menolak pengajuan mentor dan menyimpan alasan penolakan.
     *
     * @throws RuntimeException
     */
    public function reject(
        int $applicationId,
        int $reviewerId,
        string $rejectionReason
    ): MentorApplication {
        return DB::transaction(function () use (
            $applicationId,
            $reviewerId,
            $rejectionReason
        ) {
            $application = MentorApplication::query()
                ->whereKey($applicationId)
                ->lockForUpdate()
                ->first();

            if (!$application) {
                throw new RuntimeException(
                    'Pengajuan mentor tidak ditemukan.',
                    404
                );
            }

            if ($application->status !== 'pending') {
                throw new RuntimeException(
                    'Hanya pengajuan berstatus pending yang dapat ditolak.',
                    422
                );
            }

            $application->update([
                'status' => 'rejected',
                'reviewed_by' => $reviewerId,
                'reviewed_at' => now(),
                'rejection_reason' => trim($rejectionReason),
            ]);

            return $application->fresh([
                'user:id,name,email,role,status',
                'industry',
                'reviewer:id,name,email',
                'documents',
            ]);
        });
    }
}