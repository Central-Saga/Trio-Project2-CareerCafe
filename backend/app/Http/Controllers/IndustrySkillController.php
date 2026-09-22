<?php

namespace App\Http\Controllers;

use App\Models\Industry;
use App\Models\Skill;
use Illuminate\Http\Request;

class IndustrySkillController extends Controller
{
    /**
     * Get list of all industries for filter and profile dropdown (PRD Section 30.4).
     */
    public function industries()
    {
        $industries = Industry::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar industri berhasil diambil.',
            'data' => $industries,
        ]);
    }

    /**
     * Get list of all existing skills for auto-complete/tags (PRD Section 30.4).
     */
    public function skills()
    {
        $skills = Skill::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar keahlian berhasil diambil.',
            'data' => $skills,
        ]);
    }
}
