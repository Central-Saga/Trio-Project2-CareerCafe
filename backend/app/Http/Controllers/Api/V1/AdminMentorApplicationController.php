<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\MentorApplicationResource;
use App\Queries\MentorApplicationQuery;
use App\Support\ApiPagination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMentorApplicationController extends AdminApiController
{
    public function __construct(
        private readonly MentorApplicationQuery $query
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $status = null;

        if ($request->filled('status')) {
            $status = strtolower(trim($request->input('status')));

            if (!in_array($status, ['pending', 'approved', 'rejected'], true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Status filter tidak valid.',
                ], 422);
            }
        }

        $applications = $this->query->paginateForAdmin(
            $status,
            ApiPagination::perPage($request, 15)
        );

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengajuan mentor berhasil diambil.',
            'data' => MentorApplicationResource::collection(
                $applications->getCollection()
            )->resolve($request),
            'pagination' => ApiPagination::metadata($applications),
        ]);
    }
}
