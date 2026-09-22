<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    protected $table = 'mentoring_sessions';
    use HasFactory;

    protected $fillable = [
        'mentor_id',
        'mentee_id',
        'booked_slot_id',
        'topic',
        'message',
        'duration',
        'meeting_type',
        'meeting_link',
        'meeting_location',
        'status',
    ];

    protected $casts = [
        'duration' => 'integer',
    ];

    public function mentor()
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function mentee()
    {
        return $this->belongsTo(User::class, 'mentee_id');
    }

    public function bookedSlot()
    {
        return $this->belongsTo(BookedSlot::class, 'booked_slot_id');
    }

    public function feedback()
    {
        return $this->hasOne(Feedback::class, 'session_id');
    }
}
