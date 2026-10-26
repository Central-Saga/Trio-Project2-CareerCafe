<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_user_profile_and_session(): void
    {
        config(['session.driver' => 'database']);

        $response = $this->withHeader('Origin', 'http://localhost:3000')
            ->postJson('/api/v1/register', [
                'name' => 'Authentication Test',
                'email' => 'register-auth@example.test',
                'password' => 'SecurePass123!',
                'password_confirmation' => 'SecurePass123!',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'register-auth@example.test')
            ->assertJsonPath('data.user.role', 'mentee')
            ->assertJsonPath('data.user.profile.timezone', 'Asia/Jakarta')
            ->assertJsonMissingPath('data.token')
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'profile'],
                ],
            ]);

        $userId = $response->json('data.user.id');
        $sessionCookie = $response->getCookie(config('session.cookie'));
        $this->assertNotNull($sessionCookie);
        $this->assertTrue($sessionCookie->isHttpOnly());

        $this->assertDatabaseHas('users', [
            'id' => $userId,
            'email' => 'register-auth@example.test',
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('profiles', [
            'user_id' => $userId,
            'timezone' => 'Asia/Jakarta',
        ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $userId,
        ]);

        $this->withCookie(config('session.cookie'), $sessionCookie->getValue())
            ->withHeader('Origin', 'http://localhost:3000')
            ->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $userId);
    }

    public function test_login_creates_http_only_session_and_logout_revokes_it(): void
    {
        config(['session.driver' => 'database']);

        $password = 'SecurePass123!';

        $user = User::factory()->create([
            'name' => 'Login Test',
            'email' => 'login-auth@example.test',
            'password' => Hash::make($password),
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $response = $this->withHeader('Origin', 'http://localhost:3000')
            ->postJson('/api/v1/login', [
                'email' => 'login-auth@example.test',
                'password' => $password,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.id', $user->id)
            ->assertJsonMissingPath('data.token');

        $sessionCookie = $response->getCookie(config('session.cookie'));
        $this->assertNotNull($sessionCookie);
        $this->assertTrue($sessionCookie->isHttpOnly());

        $this->withCookie(config('session.cookie'), $sessionCookie->getValue())
            ->withHeader('Origin', 'http://localhost:3000')
            ->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);

        $this->withCookie(config('session.cookie'), $sessionCookie->getValue())
            ->withHeader('Origin', 'http://localhost:3000')
            ->postJson('/api/v1/logout')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
        app('auth')->forgetGuards();
        $this->withCookie(config('session.cookie'), $sessionCookie->getValue())
            ->withHeader('Origin', 'http://localhost:3000')
            ->getJson('/api/v1/me')
            ->assertUnauthorized();
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        User::factory()->create([
            'name' => 'Invalid Login Test',
            'email' => 'invalid-auth@example.test',
            'password' => Hash::make('CorrectPass123!'),
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $this->postJson('/api/v1/login', [
            'email' => 'invalid-auth@example.test',
            'password' => 'WrongPass123!',
        ])
            ->assertUnauthorized()
            ->assertJsonPath('success', false);
    }

    public function test_expired_token_is_rejected(): void
    {
        config(['sanctum.expiration' => 1440]);

        $user = User::factory()->create([
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $token = $user->createToken(
            'expired-test-token',
            ['*'],
            now()->subMinute()
        )->plainTextToken;

        app('auth')->forgetGuards();

        $this->withToken($token)
            ->getJson('/api/v1/me')
            ->assertUnauthorized();
    }

    public function test_logout_all_revokes_every_user_token(): void
    {
        $user = User::factory()->create([
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $tokenOne = $user->createToken('device-one')->plainTextToken;
        $tokenTwo = $user->createToken('device-two')->plainTextToken;

        DB::table('sessions')->insert([
            'id' => 'another-device-session',
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'test device',
            'payload' => '',
            'last_activity' => now()->timestamp,
        ]);

        $this->withToken($tokenOne)
            ->postJson('/api/v1/logout-all')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
        $this->assertDatabaseMissing('sessions', [
            'user_id' => $user->id,
        ]);

        app('auth')->forgetGuards();

        $this->withToken($tokenTwo)
            ->getJson('/api/v1/me')
            ->assertUnauthorized();
    }

    public function test_current_user_endpoint_requires_authentication(): void
    {
        $this->getJson('/api/v1/me')->assertUnauthorized();
    }

    public function test_csrf_endpoint_sets_xsrf_cookie_for_the_frontend_origin(): void
    {
        $response = $this->withHeader('Origin', 'http://localhost:3000')
            ->get('/sanctum/csrf-cookie');

        $response
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
            ->assertHeader('Access-Control-Allow-Credentials', 'true');

        $xsrfCookie = $response->getCookie('XSRF-TOKEN');
        $this->assertNotNull($xsrfCookie);
        $this->assertFalse($xsrfCookie->isHttpOnly());
    }

    public function test_logout_all_invalidates_every_database_session(): void
    {
        config(['session.driver' => 'database']);

        $user = User::factory()->create([
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $loginResponse = $this->withHeader('Origin', 'http://localhost:3000')
            ->postJson('/api/v1/login', [
                'email' => $user->email,
                'password' => 'password',
            ]);

        $loginResponse->assertOk();
        $sessionCookie = $loginResponse->getCookie(config('session.cookie'));
        $this->assertNotNull($sessionCookie);

        DB::table('sessions')->insert([
            'id' => 'second-device-session',
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'second test device',
            'payload' => '',
            'last_activity' => now()->timestamp,
        ]);

        $this->withCookie(config('session.cookie'), $sessionCookie->getValue())
            ->withHeader('Origin', 'http://localhost:3000')
            ->postJson('/api/v1/logout-all')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('sessions', [
            'user_id' => $user->id,
        ]);

        app('auth')->forgetGuards();
        $this->withCookie(config('session.cookie'), $sessionCookie->getValue())
            ->withHeader('Origin', 'http://localhost:3000')
            ->getJson('/api/v1/me')
            ->assertUnauthorized();
    }
}
