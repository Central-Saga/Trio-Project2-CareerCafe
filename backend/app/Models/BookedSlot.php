<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookedSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'mentor_id',
        'date',
        'start_time',
        'end_time',
        'status',
        'availability_id',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public function mentor()
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function availability()
    {
        return $this->belongsTo(Availability::class, 'availability_id');
    }

    public function session()
    {
        return $this->hasOne(Session::class, 'booked_slot_id');
    }
}
