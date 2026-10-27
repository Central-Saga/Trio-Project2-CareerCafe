<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use RuntimeException;

class AuthService
{
    /**
     * Mendaftarkan pengguna dan membuat profil.
     *
     * @param  array<string, mixed>  $validated
     */
    public function register(array $validated): User
    {
        return DB::transaction(function () use ($validated): User {
            $role = array_key_exists('role', $validated)
                ? $validated['role']
                : 'mentee';

            $user = User::query()->create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $role,
                'status' => 'active',
            ]);

            $user->profile()->create([
                'timezone' => 'Asia/Jakarta',
                'avg_rating' => 0.00,
                'total_reviews' => 0,
            ]);

            return $user->load('profile');
        });
    }

    /**
     * Memeriksa kredensial login.
     *
     * @param  array<string, mixed>  $validated
     *
     * @throws RuntimeException Jika kredensial salah atau akun nonaktif.
     */
    public function login(array $validated): User
    {
        $user = User::query()
            ->with(['profile.industry', 'skills'])
            ->where('email', $validated['email'])
            ->first();

        if (
            ! $user ||
            ! Hash::check($validated['password'], $user->password)
        ) {
            throw new RuntimeException(
                'Email atau kata sandi tidak sesuai.',
                401
            );
        }

        if ($user->status === 'inactive') {
            throw new RuntimeException(
                'Akun Anda sedang dinonaktifkan.',
                403
            );
        }

        return $user;
    }

    /**
     * Mencabut token yang sedang digunakan.
     */
    public function logout(User $user): void
    {
        $currentToken = $user->currentAccessToken();

        if ($currentToken instanceof PersonalAccessToken) {
            $currentToken->delete();
        }
    }

    /**
     * Mencabut seluruh token pengguna.
     */
    public function logoutAll(User $user): void
    {
        $user->tokens()->delete();

        DB::table(config('session.table', 'sessions'))
            ->where('user_id', $user->getKey())
            ->delete();
    }

    /**
     * Mengambil data pengguna beserta profil dan skills.
     */
    public function currentUser(User $user): User
    {
        return $user->load([
            'profile.industry',
            'skills',
        ]);
    }
}
