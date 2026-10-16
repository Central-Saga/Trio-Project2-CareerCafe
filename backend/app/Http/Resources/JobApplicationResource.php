<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobApplicationResource extends JsonResource
{
    /**
     * Standard API representation for a job application.
     *
     * Keep the fields compatible with the existing frontend.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_id' => $this->job_id,
            'user_id' => $this->user_id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'cv_path' => $this->cv_path,
            'cover_letter' => $this->cover_letter,
            'portfolio_url' => $this->portfolio_url,
            'status' => $this->status,
            'applied_at' => $this->applied_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'job' => $this->whenLoaded('job', function () {
                $job = $this->job;

                if (!$job) {
                    return null;
                }

                return [
                    'id' => $job->id,
                    'title' => $job->title,
                    'company' => $job->company,
                    'location' => $job->location,
                    'type' => $job->type,
                    'category' => $job->category,
                    'salary' => $job->salary,
                ];
            }, null),
        ];
    }
}
