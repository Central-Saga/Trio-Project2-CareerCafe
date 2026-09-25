<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MentorApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'job_title',
        'company',
        'location',
        'experience_years',
        'education',
        'industry_id',
        'bio',
        'motivation',
        'linkedin_url',
        'skills',
        'status',
        'reviewed_by',
        'rejection_reason',
        'reviewed_at',
    ];

    protected $casts = [
        'skills' => 'array',
        'experience_years' => 'integer',
        'reviewed_at' => 'datetime',
    ];

    /**
     * Relasi ke user yang mengajukan.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    /**
     * Relasi ke industri.
     */
    public function industry(): BelongsTo
    {
        return $this->belongsTo(
            Industry::class,
            'industry_id'
        );
    }

    /**
     * Relasi ke admin yang melakukan review.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'reviewed_by'
        );
    }

    /**
     * Relasi ke dokumen bukti verifikasi.
     *
     * Satu aplikasi mentor dapat memiliki
     * maksimal 3 dokumen.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(
            MentorApplicationDocument::class,
            'mentor_application_id'
        )->latest('id');
    }
}