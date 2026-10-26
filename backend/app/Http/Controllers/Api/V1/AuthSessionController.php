<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthSessionController extends Controller
{
    public function __construct(
        private readonly AuthService $authService
    ) {}

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());
        $this->invalidateSession($request);

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
            'data' => null,
        ]);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $this->authService->logoutAll($request->user());
        $this->invalidateSession($request);

        return response()->json([
            'success' => true,
            'message' => 'Logout dari semua perangkat berhasil.',
            'data' => null,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $this->authService->currentUser($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Data pengguna berhasil diambil.',
            'data' => UserResource::make($user)->resolve($request),
        ]);
    }

    private function invalidateSession(Request $request): void
    {
        if (! $request->hasSession()) {
            return;
        }

        Auth::shouldUse('web');
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
