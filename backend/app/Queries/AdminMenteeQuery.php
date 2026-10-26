<?php

namespace App\Queries;

use App\Models\User;
use App\Support\ApiPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class AdminMenteeQuery
{
    /**
     * Mengambil daftar mentee dengan pencarian, filter, dan pagination.
     */
    public function paginate(Request $request): LengthAwarePaginator
    {
        $query = $this->baseQuery();

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            if ($search !== '') {
                $query->where(function (Builder $userQuery) use ($search) {
                    $userQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('profile', function (Builder $profileQuery) use ($search) {
                            $profileQuery
                                ->where('job_title', 'like', "%{$search}%")
                                ->orWhere('company', 'like', "%{$search}%")
                                ->orWhere('location', 'like', "%{$search}%");
                        });
                });
            }
        }

        if ($request->filled('status')) {
            $status = strtolower(
                trim((string) $request->input('status'))
            );

            if (!in_array($status, ['active', 'inactive'], true)) {
                throw new \InvalidArgumentException(
                    'Status filter tidak valid.'
                );
            }

            $query->where('status', $status);
        }

        return $query
            ->latest('id')
            ->paginate(ApiPagination::perPage($request, 20));
    }

    /**
     * Mengambil detail mentee berdasarkan ID.
     */
    public function findById(int $id): ?User
    {
        return $this->baseQuery()->find($id);
    }

    /**
     * Query dasar yang konsisten untuk daftar dan detail mentee.
     */
    private function baseQuery(): Builder
    {
        return User::query()
            ->where('role', 'mentee')
            ->with([
                'profile:id,user_id,profile_photo,cover_photo,job_title,company,location,experience_years,education,bio,linkedin_url,timezone',
            ])
            ->withCount([
                'menteeSessions as total_sessions_count',
                'menteeSessions as completed_sessions_count' => function (Builder $query) {
                    $query->where('status', 'completed');
                },
                'menteeSessions as pending_sessions_count' => function (Builder $query) {
                    $query->where('status', 'pending');
                },
                'menteeSessions as approved_sessions_count' => function (Builder $query) {
                    $query->where('status', 'approved');
                },
            ]);
    }
}