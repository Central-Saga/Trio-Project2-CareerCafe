<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Http\Resources\PostResource;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    /**
     * Get career community posts with optional category filter and search (PRD FR-15, Section 30.5).
     */
    public function index(Request $request)
    {
        $query = Post::with(['user:id,name,role', 'user.profile:id,user_id,profile_photo,job_title,company'])
            ->where('status', 'published');

        // Filter by category
        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Search in title and content
        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', $search)
                  ->orWhere('content', 'ilike', $search);
            });
        }

        $perPage = \App\Support\ApiPagination::perPage($request, 10);
        $posts = $query->latest('id')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar postingan Career Feed berhasil diambil.',
            'data' => PostResource::collection($posts->getCollection())->resolve($request),
            'pagination' => \App\Support\ApiPagination::metadata($posts),
        ]);
    }

    /**
     * Get single post detail.
     */
    public function show(Request $request, $id)
    {
        $post = Post::with(['user:id,name,role', 'user.profile:id,user_id,profile_photo,job_title,company,bio'])
            ->where('status', 'published')
            ->find($id);

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

    /**
     * Create new career feed post (PRD FR-16).
     */
    public function store(StorePostRequest $request)
    {
        $user = $request->user();

        if (!Gate::forUser($user)->allows('create', Post::class)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk membuat postingan.',
            ], 403);
        }

        $validated = $request->validated();

        $post = Post::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'category' => $validated['category'],
            'status' => 'published',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Postingan berhasil dipublikasikan di Career Feed.',
            'data' => PostResource::make($post->load([
                'user:id,name,role',
                'user.profile:id,user_id,profile_photo,job_title,company',
            ]))->resolve($request),
        ], 201);
    }

    /**
     * Update own post (PRD FR-17).
     */
    public function update(UpdatePostRequest $request, $id)
    {
        $user = $request->user();
        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Postingan tidak ditemukan.',
            ], 404);
        }

        // Business Rule 7: User hanya dapat mengedit post miliknya sendiri
        if (!Gate::forUser($user)->allows('update', $post)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk mengedit postingan ini.',
            ], 403);
        }

        $validated = $request->validated();

        $post->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Postingan berhasil diperbarui.',
            'data' => PostResource::make($post->fresh(['user:id,name,role', 'user.profile']))->resolve($request),
        ]);
    }

    /**
     * Delete own post (PRD FR-17).
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Postingan tidak ditemukan.',
            ], 404);
        }

        // Business Rule 7: User hanya dapat menghapus post miliknya sendiri
        if (!Gate::forUser($user)->allows('delete', $post)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk menghapus postingan ini.',
            ], 403);
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Postingan berhasil dihapus.',
            'data' => null,
        ]);
    }
}
