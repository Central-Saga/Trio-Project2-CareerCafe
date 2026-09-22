<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

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

        $perPage = (int) $request->input('per_page', 10);
        $posts = $query->latest('id')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar postingan Career Feed berhasil diambil.',
            'data' => $posts->items(),
            'pagination' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    /**
     * Get single post detail.
     */
    public function show($id)
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
            'data' => $post,
        ]);
    }

    /**
     * Create new career feed post (PRD FR-16).
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'content' => ['required', 'string', 'min:10'],
            'category' => [
                'required',
                'string',
                Rule::in([
                    'Career Story',
                    'Industry Insight',
                    'Interview Tips',
                    'Work Experience',
                    'Networking Tips'
                ]),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi postingan gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $post = Post::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'content' => $request->content,
            'category' => $request->category,
            'status' => 'published',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Postingan berhasil dipublikasikan di Career Feed.',
            'data' => $post->load(['user:id,name,role', 'user.profile:id,user_id,profile_photo,job_title,company']),
        ], 201);
    }

    /**
     * Update own post (PRD FR-17).
     */
    public function update(Request $request, $id)
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
        if ($post->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk mengedit postingan ini.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'required', 'string', 'min:3', 'max:255'],
            'content' => ['sometimes', 'required', 'string', 'min:10'],
            'category' => [
                'sometimes',
                'required',
                'string',
                Rule::in([
                    'Career Story',
                    'Industry Insight',
                    'Interview Tips',
                    'Work Experience',
                    'Networking Tips'
                ]),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi pembaruan postingan gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $post->update($request->only(['title', 'content', 'category']));

        return response()->json([
            'success' => true,
            'message' => 'Postingan berhasil diperbarui.',
            'data' => $post->fresh(['user:id,name,role', 'user.profile']),
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
        if ($post->user_id !== $user->id && $user->role !== 'admin') {
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
