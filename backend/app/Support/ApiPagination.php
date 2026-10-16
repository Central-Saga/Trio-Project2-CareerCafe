<?php

namespace App\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

final class ApiPagination
{
    public static function perPage(Request $request, int $default = 20): int
    {
        $raw = $request->input('per_page', $default);

        if (is_array($raw) || is_object($raw) || is_bool($raw)) {
            $raw = $default;
        }

        $parsed = filter_var($raw, FILTER_VALIDATE_INT);

        if ($parsed === false) {
            $parsed = $default;
        }

        return max(1, min((int) $parsed, 100));
    }

    public static function metadata(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];
    }
}
