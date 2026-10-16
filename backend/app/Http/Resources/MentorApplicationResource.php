<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MentorApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'full_name' => $this->full_name,
            'job_title' => $this->job_title,
            'company' => $this->company,
            'location' => $this->location,
            'experience_years' => $this->experience_years,
            'education' => $this->education,
            'industry_id' => $this->industry_id,
            'bio' => $this->bio,
            'motivation' => $this->motivation,
            'linkedin_url' => $this->linkedin_url,
            'skills' => $this->skills,
            'status' => $this->status,
            'reviewed_by' => $this->reviewed_by,
            'rejection_reason' => $this->rejection_reason,
            'reviewed_at' => $this->reviewed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'user' => $this->whenLoaded('user'),
            'industry' => $this->whenLoaded('industry'),
            'reviewer' => $this->whenLoaded('reviewer'),
            'documents' => $this->whenLoaded('documents'),
        ];
    }
}
