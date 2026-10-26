<?php

namespace App\Queries;

use App\Models\Post;
use App\Support\ApiPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class PostQuery
{
    public function paginatePublished(
        Request $request
    ): LengthAwarePaginator {
        $query = Post::query()
            ->with([
                'user:id,name,role',
                'user.profile:id,user_id,profile_photo,job_title,company',
            ])
            ->where('status', 'published');

        if (
            $request->filled('category') &&
            $request->input('category') !== 'all'
        ) {
            $query->where('category', $request->input('category'));
        }

        $search = trim((string) $request->input('search', ''));

        if ($search !== '') {
            $pattern = '%' . $search . '%';

            $query->where(function ($builder) use ($pattern) {
                $builder
                    ->where('title', 'ilike', $pattern)
                    ->orWhere('content', 'ilike', $pattern);
            });
        }

        return $query
            ->latest('id')
            ->paginate(ApiPagination::perPage($request, 10));
    }

    public function findPublished(int $id): ?Post
    {
        return Post::query()
            ->with([
                'user:id,name,role',
                'user.profile:id,user_id,profile_photo,job_title,company,bio',
            ])
            ->where('status', 'published')
            ->find($id);
    }

    public function findById(int $id): ?Post
    {
        return Post::query()->find($id);
    }
}
