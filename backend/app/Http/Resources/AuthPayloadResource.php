<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthPayloadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user' => (new UserResource($this->resource['user']))
                ->resolve($request),
            'token' => $this->resource['token'],
            'token_type' => $this->resource['token_type'],
        ];
    }
}
