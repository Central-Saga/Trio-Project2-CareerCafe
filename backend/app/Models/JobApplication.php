<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'user_id',
        'full_name',
        'email',
        'phone',
        'cv_path',
        'cover_letter',
        'portfolio_url',
        'status',
        'applied_at',
    ];

    protected $casts = [
        'applied_at' => 'datetime',
    ];

    /**
     * Lamaran ini untuk pekerjaan apa?
     */
    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    /**
     * Lamaran ini dibuat oleh user siapa?
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}