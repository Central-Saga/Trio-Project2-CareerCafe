<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use RuntimeException;
use Tests\TestCase;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    private AuthService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(AuthService::class);
    }

    public function test_register_creates_user_profile_and_token(): void
    {
        $result = $this->service->register([
            'name' => 'Auth Service User',
            'email' => 'auth-service@example.test',
            'password' => 'SecurePassword123!',
            'role' => 'mentee',
        ]);

        $this->assertSame('Bearer', $result['token_type']);
        $this->assertNotEmpty($result['token']);
        $this->assertSame('Auth Service User', $result['user']->name);
        $this->assertSame('mentee', $result['user']->role);

        $this->assertDatabaseHas('users', [
            'email' => 'auth-service@example.test',
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('profiles', [
            'user_id' => $result['user']->id,
            'timezone' => 'Asia/Jakarta',
        ]);

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $result['user']->id,
            'name' => 'auth_token',
        ]);
    }

    public function test_login_returns_user_and_bearer_token(): void
    {
        $user = $this->makeAuthUser([
            'email' => 'login-service@example.test',
            'status' => 'active',
        ]);

        $result = $this->service->login([
            'email' => $user->email,
            'password' => 'SecurePassword123!',
        ]);

        $this->assertSame($user->id, $result['user']->id);
        $this->assertSame('Bearer', $result['token_type']);
        $this->assertNotEmpty($result['token']);

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'auth_token',
        ]);
    }

    public function test_login_rejects_invalid_password(): void
    {
        $user = $this->makeAuthUser([
            'email' => 'wrong-password@example.test',
        ]);

        try {
            $this->service->login([
                'email' => $user->email,
                'password' => 'WrongPassword123!',
            ]);

            $this->fail('Expected login to reject invalid credentials.');
        } catch (RuntimeException $exception) {
            $this->assertSame(401, $exception->getCode());
        }

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'auth_token',
        ]);
    }

    public function test_login_rejects_inactive_account(): void
    {
        $user = $this->makeAuthUser([
            'email' => 'inactive-account@example.test',
            'status' => 'inactive',
        ]);

        try {
            $this->service->login([
                'email' => $user->email,
                'password' => 'SecurePassword123!',
            ]);

            $this->fail('Expected inactive account to be rejected.');
        } catch (RuntimeException $exception) {
            $this->assertSame(403, $exception->getCode());
        }

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'auth_token',
        ]);
    }

    public function test_logout_all_revokes_every_user_token(): void
    {
        $user = $this->makeAuthUser();

        $user->createToken('first-device');
        $user->createToken('second-device');

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'first-device',
        ]);

        $this->service->logoutAll($user);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }

    private function makeAuthUser(array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'password' => Hash::make('SecurePassword123!'),
            'role' => 'mentee',
            'status' => 'active',
        ], $overrides));
    }
}
