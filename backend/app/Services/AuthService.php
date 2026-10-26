<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class AuthService
{
    /**
     * Mendaftarkan pengguna, membuat profil, dan menerbitkan token.
     *
     * @param array<string, mixed> $validated
     * @return array{user: User, token: string, token_type: string}
     */
    public function register(array $validated): array
    {
        return DB::transaction(function () use ($validated): array {
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

            $expiresAt = now()->addMinutes(
                (int) config('sanctum.expiration', 1440)
            );

            $token = $user->createToken(
                'auth_token',
                ['*'],
                $expiresAt
            )->plainTextToken;

            return [
                'user' => $user->load('profile'),
                'token' => $token,
                'token_type' => 'Bearer',
            ];
        });
    }

    /**
     * Memeriksa kredensial dan menerbitkan token login.
     *
     * @param array<string, mixed> $validated
     * @return array{user: User, token: string, token_type: string}
     *
     * @throws RuntimeException Jika kredensial salah atau akun nonaktif.
     */
    public function login(array $validated): array
    {
        $user = User::query()
            ->with(['profile.industry', 'skills'])
            ->where('email', $validated['email'])
            ->first();

        if (
            !$user ||
            !Hash::check($validated['password'], $user->password)
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

        $expiresAt = now()->addMinutes(
            (int) config('sanctum.expiration', 1440)
        );

        $token = $user->createToken(
            'auth_token',
            ['*'],
            $expiresAt
        )->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ];
    }

    /**
     * Mencabut token yang sedang digunakan.
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    /**
     * Mencabut seluruh token pengguna.
     */
    public function logoutAll(User $user): void
    {
        $user->tokens()->delete();
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