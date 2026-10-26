<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SessionResource;
use App\Queries\SessionQuery;
use App\Services\SessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use RuntimeException;
use Throwable;

abstract class SessionActionApiController extends Controller
{
    public function __construct(
        protected readonly SessionService $sessionService,
        protected readonly SessionQuery $sessionQuery
    ) {
    }

    protected function transition(
        Request $request,
        int $id,
        string $ability,
        callable $operation,
        string $successMessage
    ): JsonResponse {
        $session = $this->sessionQuery->findById($id);

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak ditemukan.',
            ], 404);
        }

        if (!Gate::forUser($request->user())->allows($ability, $session)) {
            $message = match ($ability) {
                'approve' =>
                    'Hanya mentor yang dituju yang dapat menyetujui sesi.',
                'reject' =>
                    'Hanya mentor yang dituju yang dapat menolak sesi.',
                'complete' =>
                    'Hanya mentor pemilik sesi yang berhak menandai sesi selesai.',
                default =>
                    'Anda tidak memiliki hak untuk membatalkan sesi ini.',
            };

            return response()->json([
                'success' => false,
                'message' => $message,
            ], 403);
        }

        try {
            $session = $operation();
        } catch (RuntimeException $exception) {
            return $this->serviceError($exception);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses perubahan status sesi.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => $successMessage,
            'data' => SessionResource::make($session)->resolve($request),
        ]);
    }

    protected function serviceError(
        RuntimeException $exception
    ): JsonResponse {
        $status = (int) $exception->getCode();

        if ($status < 400 || $status > 599) {
            $status = 400;
        }

        return response()->json([
            'success' => false,
            'message' => $exception->getMessage(),
        ], $status);
    }
}
