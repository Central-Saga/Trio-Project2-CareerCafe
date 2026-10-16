<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class ApiThrottleTest extends TestCase
{
    public function test_login_is_limited_to_five_requests_per_minute(): void
    {
        RateLimiter::clear('127.0.0.1');

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/login', [])
                ->assertStatus(422)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data',
                    'errors',
                ]);
        }

        $response = $this->postJson('/api/login', []);

        $response
            ->assertStatus(429)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'errors',
            ])
            ->assertJson([
                'success' => false,
                'data' => null,
                'errors' => null,
            ]);
    }
}
