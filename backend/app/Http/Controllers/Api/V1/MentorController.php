<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MentorResource;
use App\Queries\MentorQuery;
use App\Support\ApiPagination;
use Illuminate\Http\Request;

class MentorController extends Controller
{
    public function __construct(
        private readonly MentorQuery $mentorQuery
    ) {
    }

    /**
     * GET /api/v1/mentors
     */
    public function index(Request $request)
    {
        $mentors = $this->mentorQuery->paginate($request);

        return response()->json([
            'success' => true,
            'message' => 'Daftar mentor berhasil diambil.',
            'data' => MentorResource::collection(
                $mentors->getCollection()
            )->resolve($request),
            'pagination' => ApiPagination::metadata($mentors),
        ]);
    }

    /**
     * GET /api/v1/mentors/{id}
     */
    public function show($id)
    {
        $mentor = $this->mentorQuery->findActiveMentor($id);

        if (!$mentor) {
            return response()->json([
                'success' => false,
                'message' => 'Mentor tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail profil mentor berhasil diambil.',
            'data' => (new MentorResource($mentor))->resolve(request()),
        ]);
    }
}
