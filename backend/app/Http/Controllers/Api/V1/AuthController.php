<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\AuthPayloadResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use RuntimeException;
use Throwable;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService
    ) {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $this->authService->register($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil.',
            'data' => AuthPayloadResource::make($data)->resolve($request),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $data = $this->authService->login($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil.',
                'data' => AuthPayloadResource::make($data)->resolve($request),
            ]);
        } catch (RuntimeException $exception) {
            return $this->loginError($exception);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Login gagal. Silakan coba lagi.',
            ], 500);
        }
    }

    private function loginError(RuntimeException $exception): JsonResponse
    {
        if ($exception->getCode() === 401) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau kata sandi tidak sesuai.',
                'errors' => [
                    'email' => [
                        'Kredensial yang diberikan tidak cocok dengan data kami.',
                    ],
                ],
            ], 401);
        }

        if ($exception->getCode() === 403) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda sedang dinonaktifkan.',
            ], 403);
        }

        report($exception);

        return response()->json([
            'success' => false,
            'message' => 'Login gagal. Silakan coba lagi.',
        ], 500);
    }
}
