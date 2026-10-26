<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SetAvailabilityRequest;
use App\Http\Resources\AvailabilityResource;
use App\Services\SlotService;
use Illuminate\Http\JsonResponse;

class SlotController extends Controller
{
    public function __construct(
        private readonly SlotService $slotService
    ) {
    }

    public function setAvailability(SetAvailabilityRequest $request): JsonResponse
    {
        $mentor = $request->user();

        if ($mentor->role !== 'mentor') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya mentor yang dapat mengatur ketersediaan.',
            ], 403);
        }

        $templates = $this->slotService->setAvailability(
            $mentor,
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' =>
                'Pola ketersediaan berhasil disimpan dan slot konkret telah dibuat.',
            'data' => AvailabilityResource::collection($templates)
                ->resolve($request),
        ]);
    }
}
