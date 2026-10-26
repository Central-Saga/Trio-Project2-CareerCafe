<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminSessionResource;
use App\Queries\AdminSessionQuery;
use App\Services\SessionService;
use App\Support\ApiPagination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class AdminSessionController extends Controller
{
    public function __construct(
        private readonly AdminSessionQuery $sessionQuery,
        private readonly SessionService $sessionService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);
        $sessions = $this->sessionQuery->paginate($request);

        return response()->json([
            'success' => true,
            'message' => 'Daftar session admin berhasil diambil.',
            'data' => AdminSessionResource::collection(
                $sessions->getCollection()
            )->resolve($request),
            'stats' => $this->sessionQuery->stats(),
            'pagination' => ApiPagination::metadata($sessions),
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request);
        $session = $this->sessionQuery->findWithDetails($id);

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Session tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail session berhasil diambil.',
            'data' => AdminSessionResource::make($session)->resolve($request),
        ]);
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request);

        try {
            $session = $this->sessionService->complete($id);
            $session->load('feedback');

            return response()->json([
                'success' => true,
                'message' => 'Session berhasil ditandai sebagai selesai.',
                'data' => AdminSessionResource::make($session)->resolve($request),
            ]);
        } catch (RuntimeException $exception) {
            $status = (int) $exception->getCode();

            if (!in_array($status, [404, 422], true)) {
                $status = 400;
            }

            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], $status);
        }
    }

    private function ensureAdmin(Request $request): void
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            abort(response()->json([
                'success' => false,
                'message' => 'Hanya admin yang dapat mengakses fitur ini.',
            ], 403));
        }
    }
}
