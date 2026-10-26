<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Queries\PostQuery;
use App\Services\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    public function __construct(
        private readonly PostQuery $postQuery,
        private readonly PostService $postService
    ) {
    }

    public function store(StorePostRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!Gate::forUser($user)->allows('create', Post::class)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk membuat postingan.',
            ], 403);
        }

        $post = $this->postService->create($user, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Postingan berhasil dipublikasikan di Career Feed.',
            'data' => PostResource::make($post)->resolve($request),
        ], 201);
    }

    public function update(
        UpdatePostRequest $request,
        int $id
    ): JsonResponse {
        $post = $this->postQuery->findById($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Postingan tidak ditemukan.',
            ], 404);
        }

        if (!Gate::forUser($request->user())->allows('update', $post)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk mengedit postingan ini.',
            ], 403);
        }

        $post = $this->postService->update($post, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Postingan berhasil diperbarui.',
            'data' => PostResource::make($post)->resolve($request),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $post = $this->postQuery->findById($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Postingan tidak ditemukan.',
            ], 404);
        }

        if (!Gate::forUser($request->user())->allows('delete', $post)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk menghapus postingan ini.',
            ], 403);
        }

        $this->postService->delete($post);

        return response()->json([
            'success' => true,
            'message' => 'Postingan berhasil dihapus.',
            'data' => null,
        ]);
    }
}
