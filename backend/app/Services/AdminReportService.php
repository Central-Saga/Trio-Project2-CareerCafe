<?php

namespace App\Services;

use App\Models\MentorApplication;
use App\Models\Session;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminReportService
{
    /**
     * Menghasilkan statistik dan laporan dashboard admin.
     *
     * @return array<string, mixed>
     */
    public function generate(): array
    {
        $totalMentors = User::query()
            ->where('role', 'mentor')
            ->count();

        $activeMentors = User::query()
            ->where('role', 'mentor')
            ->where('status', 'active')
            ->count();

        $totalMentees = User::query()
            ->where('role', 'mentee')
            ->count();

        $activeMentees = User::query()
            ->where('role', 'mentee')
            ->where('status', 'active')
            ->count();

        $totalSessions = Session::query()->count();

        $completedSessions = Session::query()
            ->where('status', 'completed')
            ->count();

        $pendingSessions = Session::query()
            ->where('status', 'pending')
            ->count();

        $approvedSessions = Session::query()
            ->where('status', 'approved')
            ->count();

        $cancelledSessions = Session::query()
            ->whereIn('status', [
                'cancelled',
                'rejected',
                'expired',
            ])
            ->count();

        $totalApplications = MentorApplication::query()->count();

        $pendingApplications = MentorApplication::query()
            ->where('status', 'pending')
            ->count();

        $approvedApplications = MentorApplication::query()
            ->where('status', 'approved')
            ->count();

        $rejectedApplications = MentorApplication::query()
            ->where('status', 'rejected')
            ->count();

        $totalFeedback = DB::table('feedbacks')->count();

        $averageRating = (float) (
            DB::table('feedbacks')->avg('rating') ?? 0
        );

        $completionRate = $totalSessions > 0
            ? round(($completedSessions / $totalSessions) * 100, 1)
            : 0;

        $applicationApprovalRate = $totalApplications > 0
            ? round(
                ($approvedApplications / $totalApplications) * 100,
                1
            )
            : 0;

        return [
            'summary' => [
                'total_mentors' => $totalMentors,
                'active_mentors' => $activeMentors,
                'total_mentees' => $totalMentees,
                'active_mentees' => $activeMentees,

                'total_sessions' => $totalSessions,
                'pending_sessions' => $pendingSessions,
                'approved_sessions' => $approvedSessions,
                'completed_sessions' => $completedSessions,
                'cancelled_sessions' => $cancelledSessions,

                'total_applications' => $totalApplications,
                'pending_applications' => $pendingApplications,
                'approved_applications' => $approvedApplications,
                'rejected_applications' => $rejectedApplications,

                'total_feedback' => $totalFeedback,
                'average_rating' => round($averageRating, 2),

                'completion_rate' => $completionRate,
                'application_approval_rate' => $applicationApprovalRate,
            ],

            'session_status' => [
                'pending' => $pendingSessions,
                'approved' => $approvedSessions,
                'completed' => $completedSessions,
                'cancelled' => Session::query()
                    ->where('status', 'cancelled')
                    ->count(),
                'rejected' => Session::query()
                    ->where('status', 'rejected')
                    ->count(),
                'expired' => Session::query()
                    ->where('status', 'expired')
                    ->count(),
            ],

            'application_status' => [
                'pending' => $pendingApplications,
                'approved' => $approvedApplications,
                'rejected' => $rejectedApplications,
            ],

            'monthly_trend' => $this->monthlyTrend(),

            'mentor_activity' => $this->mentorActivity(),
        ];
    }

    /**
     * Tren sesi selama enam bulan, termasuk bulan berjalan.
     *
     * @return array<int, array<string, mixed>>
     */
    private function monthlyTrend(): array
    {
        $startMonth = now()
            ->startOfMonth()
            ->subMonths(5);

        $monthlyRows = Session::query()
            ->selectRaw("DATE_TRUNC('month', created_at) as month")
            ->selectRaw('COUNT(*) as total')
            ->selectRaw(
                "SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending"
            )
            ->selectRaw(
                "SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved"
            )
            ->selectRaw(
                "SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed"
            )
            ->selectRaw(
                "SUM(CASE WHEN status IN ('cancelled', 'rejected', 'expired') THEN 1 ELSE 0 END) as cancelled"
            )
            ->where('created_at', '>=', $startMonth)
            ->groupByRaw("DATE_TRUNC('month', created_at)")
            ->orderByRaw("DATE_TRUNC('month', created_at)")
            ->get();

        $monthlyMap = [];

        foreach ($monthlyRows as $row) {
            $key = date('Y-m', strtotime($row->month));

            $monthlyMap[$key] = [
                'total' => (int) $row->total,
                'pending' => (int) $row->pending,
                'approved' => (int) $row->approved,
                'completed' => (int) $row->completed,
                'cancelled' => (int) $row->cancelled,
            ];
        }

        $trend = [];

        for ($offset = 5; $offset >= 0; $offset--) {
            $month = now()
                ->startOfMonth()
                ->subMonths($offset);

            $key = $month->format('Y-m');

            $trend[] = [
                'key' => $key,
                'label' => $month->format('M Y'),
                'total' => $monthlyMap[$key]['total'] ?? 0,
                'pending' => $monthlyMap[$key]['pending'] ?? 0,
                'approved' => $monthlyMap[$key]['approved'] ?? 0,
                'completed' => $monthlyMap[$key]['completed'] ?? 0,
                'cancelled' => $monthlyMap[$key]['cancelled'] ?? 0,
            ];
        }

        return $trend;
    }

    /**
     * Delapan mentor dengan jumlah sesi terbanyak.
     *
     * @return array<int, array<string, mixed>>
     */
    private function mentorActivity(): array
    {
        $mentors = User::query()
            ->where('role', 'mentor')
            ->with([
                'profile:id,user_id,profile_photo,job_title,company,avg_rating,total_reviews',
            ])
            ->withCount([
                'mentorSessions as sessions_count',
                'mentorSessions as completed_count' => function ($query) {
                    $query->where('status', 'completed');
                },
                'mentorSessions as approved_count' => function ($query) {
                    $query->where('status', 'approved');
                },
                'mentorSessions as pending_count' => function ($query) {
                    $query->where('status', 'pending');
                },
            ])
            ->orderByDesc('sessions_count')
            ->orderByDesc('completed_count')
            ->limit(8)
            ->get();

        return $mentors->map(function ($mentor) {
            return [
                'id' => $mentor->id,
                'name' => $mentor->name,
                'email' => $mentor->email,
                'status' => $mentor->status,
                'job_title' => $mentor->profile?->job_title,
                'company' => $mentor->profile?->company,
                'profile_photo' => $mentor->profile?->profile_photo,
                'avg_rating' => $mentor->profile
                    ? (float) $mentor->profile->avg_rating
                    : 0,
                'total_reviews' => $mentor->profile
                    ? (int) $mentor->profile->total_reviews
                    : 0,
                'sessions_count' => (int) $mentor->sessions_count,
                'completed_count' => (int) $mentor->completed_count,
                'approved_count' => (int) $mentor->approved_count,
                'pending_count' => (int) $mentor->pending_count,
            ];
        })->values()->all();
    }
}