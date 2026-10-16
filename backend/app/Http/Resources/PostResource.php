<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform a post into the standard API representation.
     *
     * Keep user and profile fields compatible with the existing frontend.
     * Do not expose private user fields such as email or password.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'content' => $this->content,
            'category' => $this->category,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'user' => $this->whenLoaded('user', function () {
                $user = $this->user;

                $profile = $user->relationLoaded('profile')
                    ? $user->profile
                    : null;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->role,
                    'profile' => $profile ? [
                        'profile_photo' => $profile->profile_photo,
                        'job_title' => $profile->job_title,
                        'company' => $profile->company,
                        'bio' => $profile->bio,
                    ] : null,
                ];
            }),
        ];
    }
}
