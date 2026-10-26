<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

abstract class AdminApiController extends Controller
{
    protected function ensureAdmin(Request $request): ?JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Akses hanya diperbolehkan untuk admin.',
            ], 403);
        }

        return null;
    }

    protected function serviceError(
        RuntimeException $exception,
        string $fallbackMessage
    ): JsonResponse {
        $status = in_array((int) $exception->getCode(), [404, 422], true)
            ? (int) $exception->getCode()
            : 500;

        if ($status === 500) {
            report($exception);
        }

        return response()->json([
            'success' => false,
            'message' => $status === 500
                ? $fallbackMessage
                : $exception->getMessage(),
        ], $status);
    }
}
