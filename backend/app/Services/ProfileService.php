<?php

namespace App\Services;

use App\Models\Skill;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class ProfileService
{
    /**
     * Mengambil profil dan mengubah path media menjadi URL frontend.
     */
    public function getProfile(User $user): User
    {
        $user->load([
            'profile.industry',
            'skills',
        ]);

        if ($user->profile) {
            $user->profile->profile_photo = $this->mediaUrl(
                $user->profile->profile_photo
            );

            $user->profile->cover_photo = $this->mediaUrl(
                $user->profile->cover_photo
            );
        }

        return $user;
    }

    /**
     * Memperbarui profil dan skills dalam satu transaksi.
     *
     * @param array<string, mixed> $validated
     */
    public function updateProfile(
        User $user,
        array $validated
    ): User {
        return DB::transaction(function () use ($user, $validated) {
            if (isset($validated['name']) && trim($validated['name']) !== '') {
                $user->update([
                    'name' => trim($validated['name']),
                ]);
            }

            $profile = $user->profile()->firstOrCreate(
                ['user_id' => $user->id],
                [
                    'timezone' => 'Asia/Jakarta',
                    'avg_rating' => 0.00,
                    'total_reviews' => 0,
                ]
            );

            $profileFields = [
                'bio',
                'location',
                'linkedin_url',
                'timezone',
                'job_title',
                'company',
                'industry_id',
                'experience_years',
                'education',
            ];

            $profileData = array_intersect_key(
                $validated,
                array_flip($profileFields)
            );

            if ($profileData !== []) {
                $profile->update($profileData);
            }

            if (array_key_exists('skills', $validated)) {
                $skillIds = [];

                foreach ($validated['skills'] ?? [] as $name) {
                    $name = trim($name);

                    if ($name === '') {
                        continue;
                    }

                    $skill = Skill::query()->firstOrCreate([
                        'name' => $name,
                    ]);

                    $skillIds[] = $skill->id;
                }

                $user->skills()->sync(array_unique($skillIds));
            }

            return $user->fresh([
                'profile.industry',
                'skills',
            ]);
        });
    }

    /**
     * Mengunggah foto profil dan menggantikan foto lama.
     */
    public function uploadPhoto(
        User $user,
        UploadedFile $file
    ): string {
        return $this->uploadMedia(
            $user,
            $file,
            'profiles',
            'profile_photo'
        );
    }

    /**
     * Mengunggah cover profil dan menggantikan cover lama.
     */
    public function uploadCover(
        User $user,
        UploadedFile $file
    ): string {
        return $this->uploadMedia(
            $user,
            $file,
            'covers',
            'cover_photo'
        );
    }

    /**
     * Menghapus foto profil.
     *
     * Nilai kembalian menunjukkan apakah profil tersedia.
     */
    public function deletePhoto(User $user): bool
    {
        return $this->deleteMedia($user, 'profile_photo');
    }

    /**
     * Menghapus cover profil.
     */
    public function deleteCover(User $user): bool
    {
        return $this->deleteMedia($user, 'cover_photo');
    }

    /**
     * Menangani upload foto atau cover.
     */
    private function uploadMedia(
        User $user,
        UploadedFile $file,
        string $folder,
        string $field
    ): string {
        $extension = strtolower($file->getClientOriginalExtension());
        $filename = Str::random(40) . '.' . $extension;

        $path = $file->storeAs(
            $folder,
            $filename,
            'public'
        );

        if (!$path) {
            throw new RuntimeException(
                'File media gagal disimpan.'
            );
        }

        $url = url(Storage::disk('public')->url($path));

        try {
            $profile = $user->profile()->firstOrCreate(
                ['user_id' => $user->id],
                [
                    'timezone' => 'Asia/Jakarta',
                    'avg_rating' => 0.00,
                    'total_reviews' => 0,
                ]
            );

            $oldValue = $profile->{$field};

            $profile->{$field} = $url;
            $profile->save();
        } catch (Throwable $exception) {
            Storage::disk('public')->delete($path);

            throw $exception;
        }

        // Hapus media lama hanya setelah URL baru berhasil disimpan.
        if ($oldValue) {
            $this->deleteStoredFile($oldValue);
        }

        return $url;
    }

    /**
     * Menghapus foto atau cover.
     */
    private function deleteMedia(
        User $user,
        string $field
    ): bool {
        $profile = $user->profile;

        if (!$profile) {
            return false;
        }

        $oldValue = $profile->{$field};

        $profile->{$field} = null;
        $profile->save();

        if ($oldValue) {
            $this->deleteStoredFile($oldValue);
        }

        return true;
    }

    /**
     * Mengubah URL atau path storage menjadi URL yang dapat digunakan.
     */
    private function mediaUrl(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        if (Str::startsWith($value, ['http://', 'https://'])) {
            return $value;
        }

        if (Str::startsWith($value, '/storage/')) {
            return url($value);
        }

        if (Str::startsWith($value, 'storage/')) {
            return url('/' . $value);
        }

        return $value;
    }

    /**
     * Menghapus file lama dari public storage.
     */
    private function deleteStoredFile(?string $value): void
    {
        if (!$value) {
            return;
        }

        $path = null;

        if (Str::contains($value, '/storage/')) {
            $path = Str::after($value, '/storage/');
        } elseif (Str::startsWith($value, 'storage/')) {
            $path = Str::after($value, 'storage/');
        }

        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}