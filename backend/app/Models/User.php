<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function profile()
    {
        return $this->hasOne(Profile::class, 'user_id');
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'mentor_skills', 'user_id', 'skill_id');
    }

    public function availabilities()
    {
        return $this->hasMany(Availability::class, 'mentor_id');
    }

    public function bookedSlots()
    {
        return $this->hasMany(BookedSlot::class, 'mentor_id');
    }

    public function mentorSessions()
    {
        return $this->hasMany(Session::class, 'mentor_id');
    }

    public function menteeSessions()
    {
        return $this->hasMany(Session::class, 'mentee_id');
    }

    public function mentorFeedbacks()
    {
        return $this->hasMany(Feedback::class, 'mentor_id');
    }

    public function posts()
    {
        return $this->hasMany(Post::class, 'user_id');
    }

    public function isMentor(): bool
    {
        return $this->role === 'mentor';
    }

    public function isMentee(): bool
    {
        return $this->role === 'mentee';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
