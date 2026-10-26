<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SessionResource;
use App\Queries\SessionQuery;
use App\Support\ApiPagination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class SessionController extends Controller
{
    public function __construct(
        private readonly SessionQuery $sessionQuery
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $sessions = $this->sessionQuery
            ->applyFilters(
                $this->sessionQuery->forUser($request->user()),
                $request
            )
            ->latest('id')
            ->paginate(ApiPagination::perPage($request, 20));

        return response()->json([
            'success' => true,
            'message' => 'Daftar sesi berhasil diambil.',
            'data' => SessionResource::collection($sessions->getCollection())
                ->resolve($request),
            'pagination' => ApiPagination::metadata($sessions),
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $session = $this->sessionQuery->findWithDetails($id);

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak ditemukan.',
            ], 404);
        }

        if (!Gate::forUser($request->user())->allows('view', $session)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke sesi ini.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail sesi berhasil diambil.',
            'data' => SessionResource::make($session)->resolve($request),
        ]);
    }
}
