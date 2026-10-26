<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiCorsTest extends TestCase
{
    public function test_preflight_allows_configured_frontend_origin(): void
    {
        config([
            'cors.allowed_origins' => [
                'https://frontend.example.test',
                'https://second-frontend.example.test',
            ],
        ]);

        $response = $this->call(
            'OPTIONS',
            '/api/v1/login',
            [],
            [],
            [],
            [
                'HTTP_ORIGIN' => 'https://frontend.example.test',
                'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
                'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'content-type,authorization',
            ]
        );

        $this->assertSame(
            'https://frontend.example.test',
            $response->headers->get('Access-Control-Allow-Origin')
        );
        $this->assertSame(
            'true',
            $response->headers->get('Access-Control-Allow-Credentials')
        );
    }

    public function test_preflight_does_not_allow_unlisted_origin(): void
    {
        config([
            'cors.allowed_origins' => [
                'https://frontend.example.test',
                'https://second-frontend.example.test',
            ],
        ]);

        $response = $this->call(
            'OPTIONS',
            '/api/v1/login',
            [],
            [],
            [],
            [
                'HTTP_ORIGIN' => 'https://unlisted.example.test',
                'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
            ]
        );

        $actualOrigin = $response->headers->get('Access-Control-Allow-Origin');

        $this->assertNull(
            $actualOrigin,
            'Nilai Access-Control-Allow-Origin aktual: ' . var_export($actualOrigin, true)
        );
    }
}
