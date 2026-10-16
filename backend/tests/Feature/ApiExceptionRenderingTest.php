<?php

namespace Tests\Feature;

use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;
use Throwable;

class ApiExceptionRenderingTest extends TestCase
{
    public function test_validation_exception_uses_standard_api_schema(): void
    {
        Route::post('/api/__test-validation-schema', function () {
            throw ValidationException::withMessages([
                'email' => ['Email tidak valid.'],
            ]);
        });

        $this->postJson('/api/__test-validation-schema', [])
            ->assertStatus(422)
            ->assertExactJson([
                'success' => false,
                'message' => 'Validasi gagal.',
                'data' => null,
                'errors' => [
                    'email' => ['Email tidak valid.'],
                ],
            ]);
    }

    public function test_http_response_exception_preserves_message_and_schema(): void
    {
        Route::post('/api/__test-form-request-error', function () {
            throw new HttpResponseException(
                new JsonResponse([
                    'success' => false,
                    'message' => 'Validasi khusus gagal.',
                    'errors' => ['name' => ['Nama wajib diisi.']],
                ], 422)
            );
        });

        $this->postJson('/api/__test-form-request-error', [])
            ->assertStatus(422)
            ->assertExactJson([
                'success' => false,
                'message' => 'Validasi khusus gagal.',
                'data' => null,
                'errors' => [
                    'name' => ['Nama wajib diisi.'],
                ],
            ]);
    }

    public function test_production_api_exception_hides_internal_details(): void
    {
        Route::get('/api/__test-internal-error', function () {
            throw new \RuntimeException('Sensitive database credentials.');
        });

        $previousEnvironment = app()->environment();
        app()->instance('env', 'production');

        try {
            $response = $this->getJson('/api/__test-internal-error');
        } finally {
            app()->instance('env', $previousEnvironment);
        }

        $response
            ->assertStatus(500)
            ->assertExactJson([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.',
                'data' => null,
                'errors' => null,
            ]);

        $this->assertStringNotContainsString(
            'Sensitive database credentials.',
            $response->getContent()
        );
        $this->assertStringNotContainsString(
            'trace',
            strtolower($response->getContent())
        );
    }
}
