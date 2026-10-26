<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Queries\PostQuery;
use App\Support\ApiPagination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostReadController extends Controller
{
    public function __construct(
        private readonly PostQuery $postQuery
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $posts = $this->postQuery->paginatePublished($request);

        return response()->json([
            'success' => true,
            'message' => 'Daftar postingan Career Feed berhasil diambil.',
            'data' => PostResource::collection($posts->getCollection())
                ->resolve($request),
            'pagination' => ApiPagination::metadata($posts),
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $post = $this->postQuery->findPublished($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Postingan tidak ditemukan atau telah dihapus.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail postingan berhasil diambil.',
            'data' => PostResource::make($post)->resolve($request),
        ]);
    }
}
