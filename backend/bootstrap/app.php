<?php

use App\Http\Middleware\ApiErrorSchemaMiddleware;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(ApiErrorSchemaMiddleware::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*')
                || $request->expectsJson(),
        );

        // ValidationException standar Laravel.
        $exceptions->render(function (
            ValidationException $exception,
            Request $request
        ) {
            if (!$request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'data' => null,
                'errors' => $exception->errors(),
            ], 422);
        });

        // Pertahankan pesan dan errors dari FormRequest yang menggunakan
        // HttpResponseException, tetapi normalisasikan struktur responsnya.
        $exceptions->render(function (
            HttpResponseException $exception,
            Request $request
        ) {
            if (!$request->is('api/*')) {
                return null;
            }

            $original = $exception->getResponse();
            $status = $original->getStatusCode();
            $payload = json_decode((string) $original->getContent(), true);

            if (!is_array($payload)) {
                $payload = [];
            }

            $serverError = $status >= 500 && app()->isProduction();

            return response()->json([
                'success' => false,
                'message' => $serverError
                    ? 'Terjadi kesalahan pada server.'
                    : (is_string($payload['message'] ?? null)
                        ? $payload['message']
                        : 'Permintaan gagal.'),
                'data' => $serverError ? null : ($payload['data'] ?? null),
                'errors' => $serverError ? null : ($payload['errors'] ?? null),
            ], $status, $original->headers->all());
        });

        // Normalisasi exception API lain, misalnya 401, 403, 404, 429, dan 500.
        $exceptions->render(function (
            Throwable $exception,
            Request $request
        ) {
            if (!$request->is('api/*')) {
                return null;
            }

            if ($exception instanceof AuthenticationException) {
                $status = 401;
                $message = 'Unauthenticated.';
            } elseif ($exception instanceof AuthorizationException) {
                $status = 403;
                $message = $exception->getMessage() ?: 'Akses ditolak.';
            } elseif ($exception instanceof ModelNotFoundException) {
                $status = 404;
                $message = 'Data tidak ditemukan.';
            } elseif ($exception instanceof HttpExceptionInterface) {
                $status = $exception->getStatusCode();
                $message = $exception->getMessage()
                    ?: (Response::$statusTexts[$status] ?? 'Permintaan gagal.');
            } else {
                $status = 500;
                $message = app()->isProduction()
                    ? 'Terjadi kesalahan pada server.'
                    : ($exception->getMessage() ?: 'Terjadi kesalahan pada server.');
            }

            if ($status >= 500 && app()->isProduction()) {
                $message = 'Terjadi kesalahan pada server.';
            }

            return response()->json([
                'success' => false,
                'message' => $message,
                'data' => null,
                'errors' => null,
            ], $status);
        });
    })->create();
