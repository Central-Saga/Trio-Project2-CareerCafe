<?php

namespace App\Http\Controllers\Api\V1;

use App\Queries\MentorApplicationQuery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MentorApplicationDocumentController extends AdminApiController
{
    public function __construct(
        private readonly MentorApplicationQuery $query
    ) {
    }

    public function show(Request $request, int $id, int $documentId)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $document = $this->query->findDocument($id, $documentId);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen verifikasi tidak ditemukan.',
            ], 404);
        }

        $disk = Storage::disk('local');

        if (!$disk->exists($document->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File dokumen tidak ditemukan di storage.',
            ], 404);
        }

        return response()->file($disk->path($document->file_path), [
            'Content-Type' => $document->mime_type,
            'Content-Disposition' =>
                'inline; filename="' .
                addslashes($document->original_name) .
                '"',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
