<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedbackResource extends JsonResource
{
    /**
     * Pertahankan atribut dan relasi model yang sudah dimuat.
     */
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }
}
