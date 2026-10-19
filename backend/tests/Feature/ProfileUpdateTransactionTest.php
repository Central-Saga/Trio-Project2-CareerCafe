<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileUpdateTransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_update_persists_user_profile_and_skills(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Test User',
            'email' => 'profile-transaction@example.test',
            'role' => 'mentee',
            'status' => 'active',
        ]);

        Sanctum::actingAs($user);

        $this->putJson('/api/profile', [
            'name' => 'Updated Test User',
            'bio' => 'Testing transactional profile updates.',
            'job_title' => 'Backend Developer',
            'company' => 'Career Cafe',
            'skills' => ['Laravel', 'PostgreSQL'],
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Updated Test User')
            ->assertJsonPath(
                'data.profile.bio',
                'Testing transactional profile updates.',
            );

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Test User',
        ]);

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'bio' => 'Testing transactional profile updates.',
            'job_title' => 'Backend Developer',
            'company' => 'Career Cafe',
        ]);

        $laravelSkill = Skill::where('name', 'Laravel')->firstOrFail();
        $postgresSkill = Skill::where('name', 'PostgreSQL')->firstOrFail();

        $this->assertDatabaseHas('mentor_skills', [
            'user_id' => $user->id,
            'skill_id' => $laravelSkill->id,
        ]);

        $this->assertDatabaseHas('mentor_skills', [
            'user_id' => $user->id,
            'skill_id' => $postgresSkill->id,
        ]);
    }

    public function test_lazy_loading_prevention_is_enabled_during_testing(): void
    {
        $this->assertTrue(Model::preventsLazyLoading());
    }
}
