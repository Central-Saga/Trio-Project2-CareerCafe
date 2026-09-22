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
     * Get profile of authenticated user.
     */
    public function getProfile(Request $request)
    {
        $user = $request->user()->load(['profile.industry', 'skills']);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diambil.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'profile' => $user->profile,
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
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:60'],
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
            $user->update(['name' => $request->name]);
        }

        $profile = $user->profile()->firstOrCreate([
            'user_id' => $user->id,
        ], [
            'timezone' => 'Asia/Jakarta',
            'avg_rating' => 0.00,
            'total_reviews' => 0,
        ]);

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

        // Section 30.4: Skill firstOrCreate handling
        if ($request->has('skills')) {
            $skillNames = $request->input('skills', []);
            $skillIds = [];

            foreach ($skillNames as $name) {
                $trimmed = trim($name);
                if (!empty($trimmed)) {
                    $skill = Skill::firstOrCreate(['name' => $trimmed]);
                    $skillIds[] = $skill->id;
                }
            }

            $user->skills()->sync($skillIds);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => $user->fresh(['profile.industry', 'skills']),
        ]);
    }

    /**
     * Upload profile photo with strict validation (PRD Section 6.5 & FR-02).
     */
    public function uploadPhoto(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'photo' => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048', // 2 MB
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

        // Pastikan nama acak aman
        $extension = $file->getClientOriginalExtension();
        $randomFileName = Str::random(40) . '.' . $extension;

        // Simpan ke disk public
        $path = $file->storeAs('profiles', $randomFileName, 'public');
        $photoUrl = Storage::url($path);

        $profile = $user->profile()->firstOrCreate([
            'user_id' => $user->id,
        ]);

        // Hapus foto lama jika ada
        if ($profile->profile_photo && !Str::startsWith($profile->profile_photo, 'http')) {
            $oldPath = str_replace('/storage/', '', $profile->profile_photo);
            Storage::disk('public')->delete($oldPath);
        }

        $profile->update([
            'profile_photo' => $photoUrl,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto profil berhasil diunggah.',
            'data' => [
                'profile_photo' => $photoUrl,
            ],
        ]);
    }
}
