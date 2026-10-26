<?php

namespace App\Queries;

use App\Models\MentorApplication;
use App\Models\MentorApplicationDocument;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class MentorApplicationQuery
{
    public function forUser(int $userId): Collection
    {
        return MentorApplication::query()
            ->with([
                'industry:id,name',
                'reviewer:id,name,email',
                'documents:id,mentor_application_id,document_type,original_name,mime_type,file_size,created_at',
            ])
            ->where('user_id', $userId)
            ->latest('id')
            ->get();
    }

    public function paginateForAdmin(
        ?string $status,
        int $perPage
    ): LengthAwarePaginator {
        $query = MentorApplication::query()
            ->with([
                'user:id,name,email,role,status',
                'industry:id,name',
                'reviewer:id,name,email',
                'documents:id,mentor_application_id,document_type,original_name,mime_type,file_size,created_at',
            ])
            ->latest('id');

        if ($status !== null) {
            $query->where('status', $status);
        }

        return $query->paginate($perPage);
    }

    public function findDocument(
        int $applicationId,
        int $documentId
    ): ?MentorApplicationDocument {
        return MentorApplicationDocument::query()
            ->where('id', $documentId)
            ->where('mentor_application_id', $applicationId)
            ->first();
    }
}
