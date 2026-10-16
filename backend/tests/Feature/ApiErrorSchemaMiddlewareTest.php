<?php

namespace Tests\Feature;

use App\Http\Middleware\ApiErrorSchemaMiddleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Tests\TestCase;

class ApiErrorSchemaMiddlewareTest extends TestCase
{
    public function test_api_422_response_has_standard_error_schema(): void
    {
        $request = Request::create('/api/test-validation', 'POST');

        $response = (new ApiErrorSchemaMiddleware())->handle(
            $request,
            fn () => new JsonResponse([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => ['email' => ['Email tidak valid.']],
            ], 422)
        );

        $payload = $response->getData(true);

        $this->assertSame(422, $response->getStatusCode());
        $this->assertSame(
            ['success', 'message', 'data', 'errors'],
            array_keys($payload)
        );
        $this->assertFalse($payload['success']);
        $this->assertNull($payload['data']);
        $this->assertSame(['email' => ['Email tidak valid.']], $payload['errors']);
    }

    public function test_production_500_response_hides_trace_and_internal_message(): void
    {
        $previousEnvironment = app()->environment();
        app()->instance('env', 'production');

        try {
            $request = Request::create('/api/test-server-error', 'GET');

            $response = (new ApiErrorSchemaMiddleware())->handle(
                $request,
                fn () => new JsonResponse([
                    'message' => 'Sensitive database details.',
                    'trace' => ['internal stack trace'],
                    'exception' => 'RuntimeException',
                ], 500)
            );
        } finally {
            app()->instance('env', $previousEnvironment);
        }

        $payload = $response->getData(true);

        $this->assertSame(500, $response->getStatusCode());
        $this->assertSame(
            ['success', 'message', 'data', 'errors'],
            array_keys($payload)
        );
        $this->assertFalse($payload['success']);
        $this->assertSame('Terjadi kesalahan pada server.', $payload['message']);
        $this->assertNull($payload['data']);
        $this->assertNull($payload['errors']);
        $this->assertArrayNotHasKey('trace', $payload);
        $this->assertArrayNotHasKey('exception', $payload);
    }
}
