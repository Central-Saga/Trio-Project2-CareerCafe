<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminSessionResource extends JsonResource
{
    /**
     * Mempertahankan struktur data admin yang sudah digunakan frontend.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = $this->resource->toArray();

        $data['rejection_reason'] = $this->resource->getAttribute(
            'rejection_reason'
        );

        return $data;
    }
}