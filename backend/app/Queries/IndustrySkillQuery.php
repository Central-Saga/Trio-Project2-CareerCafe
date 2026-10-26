<?php

namespace App\Queries;

use App\Models\Industry;
use App\Models\Skill;
use Illuminate\Database\Eloquent\Collection;

class IndustrySkillQuery
{
    public function industries(): Collection
    {
        return Industry::query()->orderBy('name')->get();
    }

    public function skills(): Collection
    {
        return Skill::query()->orderBy('name')->get();
    }
}
