<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    /**
     * Register a new mentee or mentor user.
     */
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated) {
            $role = array_key_exists('role', $validated)
                ? $validated['role']
                : 'mentee';

            $user = User::create([
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

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran berhasil.',
                'data' => [
                    'user' => $user->load('profile'),
                    'token' => $token,
                    'token_type' => 'Bearer',
                ],
            ], 201);
        });
    }

    /**
     * Login user and issue Bearer token.
     */
    public function login(LoginRequest $request)
    {
        $validated = $request->validated();

        $user = User::with(['profile.industry', 'skills'])->where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau kata sandi tidak sesuai.',
                'errors' => [
                    'email' => ['Kredensial yang diberikan tidak cocok dengan data kami.']
                ],
            ], 401);
        }

        if ($user->status === 'inactive') {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda sedang dinonaktifkan.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Logout authenticated user.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
            'data' => null,
        ]);
    }

    /**
     * Get current authenticated user details.
     */
    public function me(Request $request)
    {
        $user = $request->user()->load(['profile.industry', 'skills']);

        return response()->json([
            'success' => true,
            'message' => 'Data pengguna berhasil diambil.',
            'data' => $user,
        ]);
    }
}
