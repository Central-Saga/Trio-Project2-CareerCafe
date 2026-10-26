<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminMenteeResource;
use App\Queries\AdminMenteeQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class AdminMenteeController extends Controller
{
    public function __construct(
        private readonly AdminMenteeQuery $menteeQuery
    ) {
    }

    /**
     * Admin melihat semua mentee.
     */
    public function index(Request $request): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        try {
            $mentees = $this->menteeQuery->paginate($request);
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar mentee berhasil diambil.',
            'data' => AdminMenteeResource::collection(
                $mentees->getCollection()
            )->resolve($request),
            'pagination' => \App\Support\ApiPagination::metadata($mentees),
        ]);
    }

    /**
     * Admin melihat detail satu mentee.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $mentee = $this->menteeQuery->findById($id);

        if (!$mentee) {
            return response()->json([
                'success' => false,
                'message' => 'Mentee tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail mentee berhasil diambil.',
            'data' => AdminMenteeResource::make($mentee)->resolve($request),
        ]);
    }

    /**
     * Pastikan hanya admin yang bisa mengakses endpoint.
     */
    private function ensureAdmin(Request $request): ?JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Akses hanya tersedia untuk admin.',
            ], 403);
        }

        return null;
    }
}