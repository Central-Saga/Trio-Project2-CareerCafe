<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\ProfileOverviewResource;
use App\Http\Resources\UserResource;
use App\Services\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(
        private readonly ProfileService $profileService
    ) {
    }

    public function getProfile(Request $request): JsonResponse
    {
        $user = $this->profileService->getProfile($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diambil.',
            'data' => ProfileOverviewResource::make($user)->resolve($request),
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->profileService->updateProfile(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => UserResource::make($user)->resolve($request),
        ]);
    }
}
