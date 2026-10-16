<?php

namespace Tests\Unit;

use App\Support\ApiPagination;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Tests\TestCase;

class ApiPaginationTest extends TestCase
{
    public function test_default_per_page_is_used_when_missing(): void
    {
        $request = Request::create('/api/posts', 'GET');

        $this->assertSame(10, ApiPagination::perPage($request, 10));
    }

    public function test_per_page_is_clamped_to_range_one_through_one_hundred(): void
    {
        $tooLarge = Request::create('/api/posts?per_page=500', 'GET');
        $tooSmall = Request::create('/api/posts?per_page=0', 'GET');

        $this->assertSame(100, ApiPagination::perPage($tooLarge));
        $this->assertSame(1, ApiPagination::perPage($tooSmall));
    }

    public function test_invalid_per_page_uses_default(): void
    {
        $request = Request::create('/api/posts?per_page=invalid', 'GET');

        $this->assertSame(15, ApiPagination::perPage($request, 15));
    }

    public function test_metadata_uses_consistent_schema(): void
    {
        $paginator = new LengthAwarePaginator(
            collect([1, 2]),
            50,
            10,
            2
        );

        $metadata = ApiPagination::metadata($paginator);

        $this->assertSame(
            ['current_page', 'last_page', 'per_page', 'total'],
            array_keys($metadata)
        );
        $this->assertSame([
            'current_page' => 2,
            'last_page' => 5,
            'per_page' => 10,
            'total' => 50,
        ], $metadata);
    }
}
