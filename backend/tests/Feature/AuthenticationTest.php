<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_user_profile_and_bearer_token(): void
    {
        $response = $this->postJson('/api/register', [
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
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'profile'],
                    'token',
                    'token_type',
                ],
            ]);

        $userId = $response->json('data.user.id');
        $token = $response->json('data.token');

        $this->assertNotEmpty($token);

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

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $userId,
            'name' => 'auth_token',
        ]);

        $this->withToken($token)
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $userId);
    }

    public function test_login_returns_token_and_token_can_be_revoked_by_logout(): void
    {
        $password = 'SecurePass123!';

        $user = User::factory()->create([
            'name' => 'Login Test',
            'email' => 'login-auth@example.test',
            'password' => Hash::make($password),
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login-auth@example.test',
            'password' => $password,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => ['user', 'token', 'token_type'],
            ]);

        $token = $response->json('data.token');
        $this->assertNotEmpty($token);

        $this->withToken($token)
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);

        $this->withToken($token)
            ->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'auth_token',
        ]);

        // Simulasikan request HTTP baru setelah logout.
        app('auth')->forgetGuards();

        $this->withToken($token)
            ->getJson('/api/me')
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

        $this->postJson('/api/login', [
            'email' => 'invalid-auth@example.test',
            'password' => 'WrongPass123!',
        ])
            ->assertUnauthorized()
            ->assertJsonPath('success', false);
    }

    public function test_current_user_endpoint_requires_authentication(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
    }
}
