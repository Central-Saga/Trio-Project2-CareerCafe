<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MentorController;
use App\Http\Controllers\SlotController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\IndustrySkillController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\MentorApplicationController;

/*
|--------------------------------------------------------------------------
| API Routes - Career Café (PRD Revisi v1.1)
|--------------------------------------------------------------------------
*/

// =========================================================
// Public options
// =========================================================

Route::get(
    '/industries',
    [IndustrySkillController::class, 'industries']
);

Route::get(
    '/skills',
    [IndustrySkillController::class, 'skills']
);

// =========================================================
// Authentication
// Rate limited 5 req/min per IP
// =========================================================

Route::middleware('throttle:5,1')->group(function () {
    Route::post(
        '/register',
        [AuthController::class, 'register']
    );

    Route::post(
        '/login',
        [AuthController::class, 'login']
    );
});

// =========================================================
// Jobs (Public discovery)
// =========================================================

Route::get(
    '/jobs',
    [JobController::class, 'index']
);

Route::get(
    '/jobs/{id}',
    [JobController::class, 'show']
);

// =========================================================
// Mentors (Public discovery)
// =========================================================

Route::get(
    '/mentors',
    [MentorController::class, 'index']
);

Route::get(
    '/mentors/{id}',
    [MentorController::class, 'show']
);

Route::get(
    '/mentors/{id}/availability',
    [SlotController::class, 'getAvailability']
);

Route::get(
    '/mentors/{id}/slots',
    [SlotController::class, 'getSlots']
);

Route::get(
    '/mentors/{id}/feedbacks',
    [FeedbackController::class, 'mentorFeedbacks']
);

// =========================================================
// Career Feed (Public read)
// =========================================================

Route::get(
    '/posts',
    [PostController::class, 'index']
);

Route::get(
    '/posts/{id}',
    [PostController::class, 'show']
);

// =========================================================
// Authenticated Routes (Sanctum Bearer Token)
// =========================================================

Route::middleware('auth:sanctum')->group(function () {
    // =========================================================
    // Auth & Profile
    // =========================================================

    Route::post(
        '/logout',
        [AuthController::class, 'logout']
    );

    Route::get(
        '/me',
        [AuthController::class, 'me']
    );

    Route::get(
        '/profile',
        [ProfileController::class, 'getProfile']
    );

    Route::put(
        '/profile',
        [ProfileController::class, 'updateProfile']
    );

    Route::post(
        '/profile/photo',
        [ProfileController::class, 'uploadPhoto']
    );

    Route::delete(
        '/profile/photo',
        [ProfileController::class, 'deletePhoto']
    );

    Route::post(
        '/profile/cover',
        [ProfileController::class, 'uploadCover']
    );

    Route::delete(
        '/profile/cover',
        [ProfileController::class, 'deleteCover']
    );

    // =========================================================
    // Job Applications
    // =========================================================

    Route::post(
        '/jobs/{jobId}/apply',
        [JobApplicationController::class, 'store']
    );

    Route::get(
        '/applications',
        [JobApplicationController::class, 'index']
    );

    // =========================================================
    // Mentor Applications - Mentee
    // =========================================================

    Route::get(
        '/mentor-applications/my',
        [MentorApplicationController::class, 'index']
    );

    Route::post(
        '/mentor-applications',
        [MentorApplicationController::class, 'store']
    );

    // =========================================================
    // Mentor Applications - Admin
    // =========================================================

    Route::get(
        '/admin/mentor-applications',
        [MentorApplicationController::class, 'adminIndex']
    );

    Route::patch(
        '/admin/mentor-applications/{id}/approve',
        [MentorApplicationController::class, 'approve']
    );

    Route::patch(
        '/admin/mentor-applications/{id}/reject',
        [MentorApplicationController::class, 'reject']
    );

    /*
     * Membuka dokumen verifikasi mentor.
     *
     * Dokumen tetap berada di private/local storage.
     * Hanya admin yang sudah login yang dapat mengaksesnya.
     *
     * Contoh:
     * GET /api/admin/mentor-applications/1/documents/3
     */
    Route::get(
        '/admin/mentor-applications/{id}/documents/{documentId}',
        [MentorApplicationController::class, 'viewDocument']
    );

    // =========================================================
    // Mentor Availability Management
    // =========================================================

    Route::post(
        '/availability',
        [SlotController::class, 'setAvailability']
    );

    // =========================================================
    // Mentoring Sessions
    // =========================================================

    Route::post(
        '/sessions',
        [SessionController::class, 'store']
    );

    Route::get(
        '/sessions',
        [SessionController::class, 'index']
    );

    Route::get(
        '/sessions/{id}',
        [SessionController::class, 'show']
    );

    Route::patch(
        '/sessions/{id}/approve',
        [SessionController::class, 'approve']
    );

    Route::patch(
        '/sessions/{id}/reject',
        [SessionController::class, 'reject']
    );

    Route::patch(
        '/sessions/{id}/cancel',
        [SessionController::class, 'cancel']
    );

    Route::patch(
        '/sessions/{id}/complete',
        [SessionController::class, 'complete']
    );

    // =========================================================
    // Feedback & Rating
    // =========================================================

    Route::post(
        '/sessions/{id}/feedback',
        [FeedbackController::class, 'store']
    );

    // =========================================================
    // Posts
    // =========================================================

    Route::post(
        '/posts',
        [PostController::class, 'store']
    );

    Route::put(
        '/posts/{id}',
        [PostController::class, 'update']
    );

    Route::delete(
        '/posts/{id}',
        [PostController::class, 'destroy']
    );
});