<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
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
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => ['nullable', 'string', 'min:2', 'max:255'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'location' => ['nullable', 'string', 'max:255'],
            'linkedin_url' => ['nullable', 'string', 'url', 'max:255'],
            'timezone' => ['nullable', 'string', 'max:100'],

            // Mentor specific
            'job_title' => ['nullable', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'industry_id' => ['nullable', 'exists:industries,id'],
            'experience_years' => [
                'nullable',
                'integer',
                'min:0',
                'max:60',
            ],
            'education' => ['nullable', 'string', 'max:255'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:50'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi pembaruan profil gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($request->filled('name')) {
            $user->update([
                'name' => $request->name,
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

        $profileData = $request->only([
            'bio',
            'location',
            'linkedin_url',
            'timezone',
            'job_title',
            'company',
            'industry_id',
            'experience_years',
            'education',
        ]);

        $profile->update($profileData);

        // Skill firstOrCreate handling
        if ($request->has('skills')) {
            $skillNames = $request->input('skills', []);
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
    public function uploadPhoto(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'photo' => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi foto gagal. File harus bertipe jpg, jpeg, png, atau webp dan maksimal 2MB.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $file = $request->file('photo');

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
    public function uploadCover(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cover' => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi background gagal. File harus bertipe jpg, jpeg, png, atau webp dan maksimal 2MB.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $file = $request->file('cover');

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