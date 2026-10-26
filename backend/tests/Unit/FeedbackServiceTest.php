<?php

namespace Tests\Unit;

use App\Models\BookedSlot;
use App\Models\Feedback;
use App\Models\Profile;
use App\Models\Session;
use App\Models\User;
use App\Services\FeedbackService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeedbackServiceTest extends TestCase
{
    use RefreshDatabase;

    private FeedbackService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(FeedbackService::class);
    }

    public function test_store_creates_feedback_and_updates_mentor_rating(): void
    {
        $mentor = User::factory()->create([
            'role' => 'mentor',
            'status' => 'active',
        ]);

        $mentee = User::factory()->create([
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $mentor->profile()->create([
            'timezone' => 'Asia/Jakarta',
            'avg_rating' => 0,
            'total_reviews' => 0,
        ]);

        $session = $this->makeCompletedSession($mentor, $mentee);

        $feedback = $this->service->store(
            $session,
            $mentee,
            [
                'rating' => 5,
                'comment' => 'Mentor sangat membantu.',
            ]
        );

        $this->assertInstanceOf(Feedback::class, $feedback);
        $this->assertSame($session->id, $feedback->session_id);
        $this->assertSame($mentor->id, $feedback->mentor_id);
        $this->assertSame($mentee->id, $feedback->mentee_id);
        $this->assertSame(5, $feedback->rating);
        $this->assertSame(
            'Mentor sangat membantu.',
            $feedback->comment
        );

        $this->assertDatabaseHas('feedbacks', [
            'id' => $feedback->id,
            'session_id' => $session->id,
            'mentor_id' => $mentor->id,
            'mentee_id' => $mentee->id,
            'rating' => 5,
        ]);

        $profile = Profile::where('user_id', $mentor->id)->firstOrFail();

        $this->assertEquals(5.00, (float) $profile->avg_rating);
        $this->assertSame(1, $profile->total_reviews);
    }

    public function test_store_recalculates_average_and_total_for_multiple_feedbacks(): void
    {
        $mentor = User::factory()->create([
            'role' => 'mentor',
            'status' => 'active',
        ]);

        $firstMentee = User::factory()->create([
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $secondMentee = User::factory()->create([
            'role' => 'mentee',
            'status' => 'active',
        ]);

        $mentor->profile()->create([
            'timezone' => 'Asia/Jakarta',
            'avg_rating' => 0,
            'total_reviews' => 0,
        ]);

        $firstSession = $this->makeCompletedSession(
            $mentor,
            $firstMentee
        );

        $secondSession = $this->makeCompletedSession(
            $mentor,
            $secondMentee,
            '11:00:00',
            '11:45:00'
        );

        $this->service->store(
            $firstSession,
            $firstMentee,
            ['rating' => 5, 'comment' => 'Sangat bagus.']
        );

        $this->service->store(
            $secondSession,
            $secondMentee,
            ['rating' => 4, 'comment' => 'Bagus.']
        );

        $profile = Profile::where('user_id', $mentor->id)->firstOrFail();

        $this->assertEquals(4.50, (float) $profile->avg_rating);
        $this->assertSame(2, $profile->total_reviews);

        $this->assertDatabaseCount('feedbacks', 2);
    }

    private function makeCompletedSession(
        User $mentor,
        User $mentee,
        string $startTime = '10:00:00',
        string $endTime = '10:45:00'
    ): Session {
        $slot = BookedSlot::query()->create([
            'mentor_id' => $mentor->id,
            'date' => now()->addDays(2)->toDateString(),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => 'booked',
        ]);

        return Session::query()->create([
            'mentor_id' => $mentor->id,
            'mentee_id' => $mentee->id,
            'booked_slot_id' => $slot->id,
            'topic' => 'Career mentoring',
            'message' => 'Discuss career development.',
            'duration' => 45,
            'meeting_type' => 'online',
            'meeting_link' => 'https://meet.google.com',
            'status' => 'completed',
        ]);
    }
}
