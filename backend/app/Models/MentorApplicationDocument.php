<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MentorApplicationDocument extends Model
{
    protected $fillable = [
        'mentor_application_id',
        'document_type',
        'original_name',
        'file_path',
        'mime_type',
        'file_size',
    ];

    /**
     * Relasi ke pengajuan mentor.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(
            MentorApplication::class,
            'mentor_application_id'
        );
    }
}