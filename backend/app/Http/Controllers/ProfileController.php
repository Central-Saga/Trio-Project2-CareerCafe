<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\UploadProfilePhotoRequest;
use App\Http\Requests\UploadProfileCoverRequest;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    /**
     * Mengubah URL media storage menjadi URL lengkap
     * agar bisa dipakai oleh frontend Next.js.
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
     * Menghapus file lama dari storage berdasarkan URL/path.
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
        } elseif (Str::startsWith($value, '/storage/')) {
            $path = Str::after($value, '/storage/');
        }

        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Get profile of authenticated user.
     */
    public function getProfile(Request $request)
    {
        $user = $request->user()->load([
            'profile.industry',
            'skills',
        ]);

        $profile = $user->profile;

        if ($profile) {
            $profile->profile_photo = $this->mediaUrl(
                $profile->profile_photo
            );

            $profile->cover_photo = $this->mediaUrl(
                $profile->cover_photo
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diambil.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'profile' => $profile,
                'skills' => $user->skills,
            ],
        ]);
    }

    /**
     * Update profile details.
     */
    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();

        $validated = $request->validated();

        if ($request->filled('name')) {
            $user->update([
                'name' => $validated['name'],
            ]);
        }

        $profile = $user->profile()->firstOrCreate(
            [
                'user_id' => $user->id,
            ],
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

        $profile->update($profileData);

        // Skill firstOrCreate handling
        if (array_key_exists('skills', $validated)) {
            $skillNames = $validated['skills'] ?? [];
            $skillIds = [];

            foreach ($skillNames as $name) {
                $trimmed = trim($name);

                if (!empty($trimmed)) {
                    $skill = Skill::firstOrCreate([
                        'name' => $trimmed,
                    ]);

                    $skillIds[] = $skill->id;
                }
            }

            $user->skills()->sync($skillIds);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => $user->fresh([
                'profile.industry',
                'skills',
            ]),
        ]);
    }

    /**
     * Upload profile photo.
     */
    public function uploadPhoto(UploadProfilePhotoRequest $request)
    {
        $validated = $request->validated();

        $user = $request->user();
        $file = $validated['photo'];

        $extension = strtolower(
            $file->getClientOriginalExtension()
        );

        $randomFileName =
            Str::random(40) . '.' . $extension;

        $path = $file->storeAs(
            'profiles',
            $randomFileName,
            'public'
        );

        $photoUrl = url(
            Storage::url($path)
        );

        $profile = $user->profile()->firstOrCreate(
            [
                'user_id' => $user->id,
            ],
            [
                'timezone' => 'Asia/Jakarta',
                'avg_rating' => 0.00,
                'total_reviews' => 0,
            ]
        );

        // Hapus file foto lama.
        if ($profile->profile_photo) {
            $this->deleteStoredFile(
                $profile->profile_photo
            );
        }

        // Simpan URL baru ke database.
        $profile->profile_photo = $photoUrl;
        $profile->save();

        return response()->json([
            'success' => true,
            'message' => 'Foto profil berhasil diunggah.',
            'data' => [
                'profile_photo' => $photoUrl,
            ],
        ]);
    }

    /**
     * Delete profile photo.
     */
    public function deletePhoto(Request $request)
    {
        $user = $request->user();

        $profile = $user->profile;

        if (!$profile) {
            return response()->json([
                'success' => true,
                'message' => 'Foto profil tidak ada.',
                'data' => [
                    'profile_photo' => null,
                ],
            ]);
        }

        if ($profile->profile_photo) {
            $this->deleteStoredFile(
                $profile->profile_photo
            );
        }

        $profile->profile_photo = null;
        $profile->save();

        return response()->json([
            'success' => true,
            'message' => 'Foto profil berhasil dihapus.',
            'data' => [
                'profile_photo' => null,
            ],
        ]);
    }

    /**
     * Upload cover/background profile photo.
     */
    public function uploadCover(UploadProfileCoverRequest $request)
    {
        $validated = $request->validated();

        $user = $request->user();
        $file = $validated['cover'];

        $extension = strtolower(
            $file->getClientOriginalExtension()
        );

        $randomFileName =
            Str::random(40) . '.' . $extension;

        $path = $file->storeAs(
            'covers',
            $randomFileName,
            'public'
        );

        $coverUrl = url(
            Storage::url($path)
        );

        $profile = $user->profile()->firstOrCreate(
            [
                'user_id' => $user->id,
            ],
            [
                'timezone' => 'Asia/Jakarta',
                'avg_rating' => 0.00,
                'total_reviews' => 0,
            ]
        );

        // Hapus background lama.
        if ($profile->cover_photo) {
            $this->deleteStoredFile(
                $profile->cover_photo
            );
        }

        // Simpan background baru.
        $profile->cover_photo = $coverUrl;
        $profile->save();

        return response()->json([
            'success' => true,
            'message' => 'Background profil berhasil diunggah.',
            'data' => [
                'cover_photo' => $coverUrl,
            ],
        ]);
    }

    /**
     * Delete cover/background profile photo.
     */
    public function deleteCover(Request $request)
    {
        $user = $request->user();

        $profile = $user->profile;

        if (!$profile) {
            return response()->json([
                'success' => true,
                'message' => 'Background profil tidak ada.',
                'data' => [
                    'cover_photo' => null,
                ],
            ]);
        }

        if ($profile->cover_photo) {
            $this->deleteStoredFile(
                $profile->cover_photo
            );
        }

        $profile->cover_photo = null;
        $profile->save();

        return response()->json([
            'success' => true,
            'message' => 'Background profil berhasil dihapus.',
            'data' => [
                'cover_photo' => null,
            ],
        ]);
    }
}