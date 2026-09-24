<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'company',
        'location',
        'type',
        'category',
        'skills',
        'description',
        'salary',
        'posted_at',
        'is_active',
    ];

    protected $casts = [
        'skills' => 'array',
        'posted_at' => 'datetime',
        'is_active' => 'boolean',
    ];
}