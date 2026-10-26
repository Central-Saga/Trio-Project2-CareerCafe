<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\MentorController;
use App\Http\Controllers\Api\V1\SlotController;
use App\Http\Controllers\Api\V1\SessionController;
use App\Http\Controllers\Api\V1\SessionActionController;
use App\Http\Controllers\Api\V1\FeedbackController;
use App\Http\Controllers\Api\V1\PostController;
use App\Http\Controllers\Api\V1\IndustrySkillController;
use App\Http\Controllers\Api\V1\JobController;
use App\Http\Controllers\Api\V1\JobApplicationController;
use App\Http\Controllers\Api\V1\MentorApplicationController;
use App\Http\Controllers\Api\V1\AdminMentorApplicationController;
use App\Http\Controllers\Api\V1\AdminMentorApplicationReviewController;
use App\Http\Controllers\Api\V1\MentorApplicationDocumentController;
use App\Http\Controllers\Api\V1\AdminMenteeController;
use App\Http\Controllers\Api\V1\AdminSessionController;
use App\Http\Controllers\Api\V1\AdminReportController;
use App\Http\Controllers\Api\V1\PostReadController;
use App\Http\Controllers\Api\V1\ProfileMediaController;
use App\Http\Controllers\Api\V1\SessionCreationController;
use App\Http\Controllers\Api\V1\AuthSessionController;
use App\Http\Controllers\Api\V1\MentorSlotReadController;

/*
|--------------------------------------------------------------------------
| API Routes - Career Café (PRD Revisi v1.1)
|--------------------------------------------------------------------------
*/


// =========================================================
// Public Options
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
// Jobs - Public Discovery
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
// Mentors - Public Discovery
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
    [MentorSlotReadController::class, 'getAvailability']
);

Route::get(
    '/mentors/{id}/slots',
    [MentorSlotReadController::class, 'getSlots']
);

Route::get(
    '/mentors/{id}/feedbacks',
    [FeedbackController::class, 'mentorFeedbacks']
);


// =========================================================
// Career Feed - Public Read
// =========================================================

Route::get(
    '/posts',
    [PostReadController::class, 'index']
);

Route::get(
    '/posts/{id}',
    [PostReadController::class, 'show']
);


// =========================================================
// Authenticated Routes - Sanctum Bearer Token
// =========================================================

Route::middleware('auth:sanctum')->group(function () {

    // =====================================================
    // Auth & Profile
    // =====================================================

    Route::post(
        '/logout',
        [AuthSessionController::class, 'logout']
    );

    Route::post(
        '/logout-all',
        [AuthSessionController::class, 'logoutAll']
    );

    Route::get(
        '/me',
        [AuthSessionController::class, 'me']
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
        [ProfileMediaController::class, 'uploadPhoto']
    )->middleware('throttle:10,1');

    Route::delete(
        '/profile/photo',
        [ProfileMediaController::class, 'deletePhoto']
    );

    Route::post(
        '/profile/cover',
        [ProfileMediaController::class, 'uploadCover']
    )->middleware('throttle:10,1');

    Route::delete(
        '/profile/cover',
        [ProfileMediaController::class, 'deleteCover']
    );


    // =====================================================
    // Job Applications
    // =====================================================

    Route::post(
        '/jobs/{jobId}/apply',
        [JobApplicationController::class, 'store']
    )->middleware('throttle:5,1');

    Route::get(
        '/applications',
        [JobApplicationController::class, 'index']
    );


    // =====================================================
    // Mentor Applications - Mentee
    // =====================================================

    Route::get(
        '/mentor-applications/my',
        [MentorApplicationController::class, 'index']
    );

    Route::post(
        '/mentor-applications',
        [MentorApplicationController::class, 'store']
    )->middleware('throttle:5,1');


    // =====================================================
    // Mentor Applications - Admin
    // =====================================================

    Route::get(
        '/admin/mentor-applications',
        [AdminMentorApplicationController::class, 'index']
    );

    Route::patch(
        '/admin/mentor-applications/{id}/approve',
        [AdminMentorApplicationReviewController::class, 'approve']
    )->middleware('throttle:10,1');

    Route::patch(
        '/admin/mentor-applications/{id}/reject',
        [AdminMentorApplicationReviewController::class, 'reject']
    )->middleware('throttle:10,1');

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
        [MentorApplicationDocumentController::class, 'show']
    );


    // =====================================================
    // Admin - Mentees
    // =====================================================

    Route::get(
        '/admin/mentees',
        [AdminMenteeController::class, 'index']
    );

    Route::get(
        '/admin/mentees/{id}',
        [AdminMenteeController::class, 'show']
    );


    // =====================================================
    // Admin - Sessions
    // =====================================================

    Route::get(
        '/admin/sessions',
        [AdminSessionController::class, 'index']
    );

    Route::get(
        '/admin/sessions/{id}',
        [AdminSessionController::class, 'show']
    );

    Route::patch(
        '/admin/sessions/{id}/complete',
        [AdminSessionController::class, 'complete']
    );


    // =====================================================
    // Admin - Reports
    // =====================================================

    Route::get(
        '/admin/reports',
        [AdminReportController::class, 'index']
    );


    // =====================================================
    // Mentor Availability Management
    // =====================================================

    Route::post(
        '/availability',
        [SlotController::class, 'setAvailability']
    )->middleware('throttle:10,1');


    // =====================================================
    // Mentoring Sessions
    // =====================================================

    Route::post(
        '/sessions',
        [SessionCreationController::class, 'store']
    )->middleware('throttle:10,1');

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
        [SessionActionController::class, 'approve']
    );

    Route::patch(
        '/sessions/{id}/reject',
        [SessionActionController::class, 'reject']
    );

    Route::patch(
        '/sessions/{id}/cancel',
        [SessionActionController::class, 'cancel']
    );

    Route::patch(
        '/sessions/{id}/complete',
        [SessionActionController::class, 'complete']
    );


    // =====================================================
    // Feedback & Rating
    // =====================================================

    Route::post(
        '/sessions/{id}/feedback',
        [FeedbackController::class, 'store']
    )->middleware('throttle:5,1');


    // =====================================================
    // Posts
    // =====================================================

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
