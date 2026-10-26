<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AvailabilityResource;
use App\Http\Resources\MentorSlotResource;
use App\Queries\SlotQuery;
use App\Services\SlotService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MentorSlotReadController extends Controller
{
    public function __construct(
        private readonly SlotQuery $slotQuery,
        private readonly SlotService $slotService
    ) {
    }

    public function getAvailability(int $mentorId): JsonResponse
    {
        if (!$this->slotQuery->findMentor($mentorId)) {
            return response()->json([
                'success' => false,
                'message' => 'Mentor tidak ditemukan.',
            ], 404);
        }

        $availability = $this->slotQuery->getAvailability($mentorId);

        return response()->json([
            'success' => true,
            'message' => 'Pola ketersediaan mingguan mentor berhasil diambil.',
            'data' => AvailabilityResource::collection($availability)
                ->resolve(request()),
        ]);
    }

    public function getSlots(Request $request, int $mentorId): JsonResponse
    {
        if (!$this->slotQuery->findMentor($mentorId)) {
            return response()->json([
                'success' => false,
                'message' => 'Mentor tidak ditemukan.',
            ], 404);
        }

        $fromDate = $request->query(
            'from',
            Carbon::today('UTC')->toDateString()
        );
        $toDate = $request->query(
            'to',
            Carbon::today('UTC')->addWeeks(4)->toDateString()
        );

        $this->slotService->generateConcreteSlotsForMentor($mentorId, 4);

        $slots = $this->slotQuery->getAvailableSlots(
            $mentorId,
            (string) $fromDate,
            (string) $toDate
        );

        return response()->json([
            'success' => true,
            'message' => 'Daftar slot konkret yang tersedia berhasil diambil.',
            'data' => MentorSlotResource::collection($slots)->resolve($request),
        ]);
    }
}
