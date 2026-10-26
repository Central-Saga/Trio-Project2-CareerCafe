<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSessionRequest;
use App\Http\Resources\SessionResource;
use App\Models\Session;
use App\Services\SessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use RuntimeException;

class SessionCreationController extends Controller
{
    public function __construct(
        private readonly SessionService $sessionService
    ) {
    }

    public function store(StoreSessionRequest $request): JsonResponse
    {
        $mentee = $request->user();

        if (!Gate::forUser($mentee)->allows('create', Session::class)) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Hanya mentee yang dapat membuat permintaan sesi mentoring.',
                'data' => null,
            ], 403);
        }

        try {
            $session = $this->sessionService->create(
                $mentee,
                $request->validated()
            );

            $session->load(['mentor.profile', 'bookedSlot']);

            return response()->json([
                'success' => true,
                'message' =>
                    'Permintaan coffee chat berhasil dikirim ke mentor.',
                'data' => SessionResource::make($session)->resolve($request),
            ], 201);
        } catch (RuntimeException $exception) {
            return $this->serviceError($exception);
        }
    }

    private function serviceError(RuntimeException $exception): JsonResponse
    {
        $status = (int) $exception->getCode();

        if ($status < 400 || $status > 599) {
            $status = 400;
        }

        return response()->json([
            'success' => false,
            'message' => $exception->getMessage(),
            'errors' => [
                'booked_slot_id' => [$exception->getMessage()],
            ],
        ], $status);
    }
}
