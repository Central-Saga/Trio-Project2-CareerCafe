<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminReportResource;
use App\Services\AdminReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    public function __construct(
        private readonly AdminReportService $reportService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isAdmin()) {
            abort(response()->json([
                'success' => false,
                'message' => 'Hanya admin yang dapat mengakses laporan.',
            ], 403));
        }

        return response()->json([
            'success' => true,
            'message' => 'Laporan admin berhasil diambil.',
            'data' => AdminReportResource::make(
                $this->reportService->generate()
            )->resolve($request),
        ]);
    }
}
