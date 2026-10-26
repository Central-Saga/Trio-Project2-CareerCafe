<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\IndustryResource;
use App\Http\Resources\SkillResource;
use App\Queries\IndustrySkillQuery;
use Illuminate\Http\JsonResponse;

class IndustrySkillController extends Controller
{
    public function __construct(
        private readonly IndustrySkillQuery $query
    ) {
    }

    public function industries(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Daftar industri berhasil diambil.',
            'data' => IndustryResource::collection(
                $this->query->industries()
            )->resolve(request()),
        ]);
    }

    public function skills(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Daftar keahlian berhasil diambil.',
            'data' => SkillResource::collection(
                $this->query->skills()
            )->resolve(request()),
        ]);
    }
}
