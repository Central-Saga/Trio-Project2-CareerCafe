<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiErrorSchemaMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (!$request->is('api/*') || $response->getStatusCode() < 400) {
            return $response;
        }

        $status = $response->getStatusCode();
        $payload = json_decode((string) $response->getContent(), true);

        if (!is_array($payload)) {
            $payload = [];
        }

        $message = $payload['message'] ?? 'Permintaan gagal.';

        // Jangan bocorkan detail internal server ketika production.
        if ($status >= 500 && app()->isProduction()) {
            $message = 'Terjadi kesalahan pada server.';
        }

        // Bangun ulang payload agar trace dan detail internal tidak ikut keluar.
        $serverError = $status >= 500 && app()->isProduction();

        $normalized = [
            'success' => false,
            'message' => $serverError
                ? 'Terjadi kesalahan pada server.'
                : (is_string($message) ? $message : 'Permintaan gagal.'),
            'data' => $serverError ? null : ($payload['data'] ?? null),
            'errors' => $serverError ? null : ($payload['errors'] ?? null),
        ];

        return response()->json(
            $normalized,
            $status,
            $response->headers->all()
        );
    }
}
