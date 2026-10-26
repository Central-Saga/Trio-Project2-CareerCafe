<?php

namespace App\Queries;

use App\Models\Session;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class AdminSessionQuery
{
    /**
     * Mengambil daftar sesi admin dengan pencarian, filter, dan pagination.
     */
    public function paginate(Request $request): LengthAwarePaginator
    {
        $query = $this->listingQuery();

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            if ($search !== '') {
                $query->where(function (Builder $builder) use ($search) {
                    $builder
                        ->where('topic', 'ilike', "%{$search}%")
                        ->orWhere('message', 'ilike', "%{$search}%")
                        ->orWhereHas('mentor', function (Builder $mentorQuery) use ($search) {
                            $mentorQuery
                                ->where('name', 'ilike', "%{$search}%")
                                ->orWhere('email', 'ilike', "%{$search}%");
                        })
                        ->orWhereHas('mentee', function (Builder $menteeQuery) use ($search) {
                            $menteeQuery
                                ->where('name', 'ilike', "%{$search}%")
                                ->orWhere('email', 'ilike', "%{$search}%");
                        });
                });
            }
        }

        if ($request->filled('status')) {
            $status = strtolower(trim((string) $request->input('status')));

            if ($status === 'cancelled') {
                $query->whereIn('status', [
                    'cancelled',
                    'rejected',
                    'expired',
                ]);
            } elseif (in_array($status, [
                'pending',
                'approved',
                'completed',
                'rejected',
                'expired',
            ], true)) {
                $query->where('status', $status);
            }
        }

        return $query
            ->latest('id')
            ->paginate(
                \App\Support\ApiPagination::perPage($request, 20)
            );
    }

    /**
     * Statistik keseluruhan, tidak terpengaruh filter daftar.
     *
     * @return array<string, int>
     */
    public function stats(): array
    {
        return [
            'total' => Session::query()->count(),
            'pending' => Session::query()
                ->where('status', 'pending')
                ->count(),
            'approved' => Session::query()
                ->where('status', 'approved')
                ->count(),
            'completed' => Session::query()
                ->where('status', 'completed')
                ->count(),
            'cancelled' => Session::query()
                ->whereIn('status', [
                    'cancelled',
                    'rejected',
                    'expired',
                ])
                ->count(),
        ];
    }

    /**
     * Mengambil detail sesi beserta relasi untuk admin.
     */
    public function findWithDetails(int $id): ?Session
    {
        return Session::query()
            ->with([
                'mentor:id,name,email',
                'mentor.profile',
                'mentee:id,name,email',
                'mentee.profile',
                'bookedSlot',
                'feedback',
            ])
            ->find($id);
    }

    /**
     * Query awal untuk daftar sesi.
     */
    private function listingQuery(): Builder
    {
        return Session::query()->with([
            'mentor:id,name,email',
            'mentor.profile:id,user_id,profile_photo,job_title,company,location,timezone',
            'mentee:id,name,email',
            'mentee.profile:id,user_id,profile_photo,job_title,company,location,timezone',
            'bookedSlot',
            'feedback',
        ]);
    }
}