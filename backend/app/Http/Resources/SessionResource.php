<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'mentor_id' => $this->mentor_id,
            'mentee_id' => $this->mentee_id,
            'booked_slot_id' => $this->booked_slot_id,
            'topic' => $this->topic,
            'message' => $this->message,
            'duration' => $this->duration,
            'meeting_type' => $this->meeting_type,
            'meeting_link' => $this->meeting_link,
            'meeting_location' => $this->meeting_location,
            'status' => $this->status,
            'rejection_reason' => $this->rejection_reason,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'mentor' => $this->whenLoaded('mentor'),
            'mentee' => $this->whenLoaded('mentee'),
            'booked_slot' => $this->whenLoaded('bookedSlot'),
            'feedback' => $this->whenLoaded('feedback'),
        ];
    }
}
