<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadProfileCoverRequest;
use App\Http\Requests\UploadProfilePhotoRequest;
use App\Http\Resources\ProfileMediaResource;
use App\Services\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileMediaController extends Controller
{
    public function __construct(
        private readonly ProfileService $profileService
    ) {
    }

    public function uploadPhoto(UploadProfilePhotoRequest $request): JsonResponse
    {
        $url = $this->profileService->uploadPhoto(
            $request->user(),
            $request->validated()['photo']
        );

        return $this->uploadResponse(
            'profile_photo',
            $url,
            'Foto profil berhasil diunggah.'
        );
    }

    public function deletePhoto(Request $request): JsonResponse
    {
        return $this->deleteResponse(
            'profile_photo',
            'Foto profil',
            $this->profileService->deletePhoto($request->user())
        );
    }

    public function uploadCover(UploadProfileCoverRequest $request): JsonResponse
    {
        $url = $this->profileService->uploadCover(
            $request->user(),
            $request->validated()['cover']
        );

        return $this->uploadResponse(
            'cover_photo',
            $url,
            'Background profil berhasil diunggah.'
        );
    }

    public function deleteCover(Request $request): JsonResponse
    {
        return $this->deleteResponse(
            'cover_photo',
            'Background profil',
            $this->profileService->deleteCover($request->user())
        );
    }

    private function uploadResponse(
        string $field,
        string $url,
        string $message
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => ProfileMediaResource::make([$field => $url])
                ->resolve(request()),
        ]);
    }

    private function deleteResponse(
        string $field,
        string $label,
        bool $profileExists
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $profileExists
                ? "{$label} berhasil dihapus."
                : "{$label} tidak ada.",
            'data' => ProfileMediaResource::make([$field => null])
                ->resolve(request()),
        ]);
    }
}
