<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'industry_id',
        'profile_photo',
        'bio',
        'location',
        'job_title',
        'company',
        'experience_years',
        'education',
        'linkedin_url',
        'timezone',
        'avg_rating',
        'total_reviews',
    ];

    protected $casts = [
        'avg_rating' => 'decimal:2',
        'total_reviews' => 'integer',
        'experience_years' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function industry()
    {
        return $this->belongsTo(Industry::class, 'industry_id');
    }
}
