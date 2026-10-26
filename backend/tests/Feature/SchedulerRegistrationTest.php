<?php

namespace Tests\Feature;

use Illuminate\Console\Scheduling\Schedule;
use Tests\TestCase;

class SchedulerRegistrationTest extends TestCase
{
    public function test_session_and_slot_commands_are_scheduled_once_with_overlap_protection(): void
    {
        $this->artisan('schedule:list')->assertExitCode(0);

        $expectedEvents = [
            'sessions:expire' => [
                'expression' => '*/5 * * * *',
                'expires_at' => 15,
            ],
            'sessions:autocomplete' => [
                'expression' => '*/5 * * * *',
                'expires_at' => 15,
            ],
            'slots:generate' => [
                'expression' => '5 0 * * *',
                'expires_at' => 120,
            ],
        ];

        $events = app(Schedule::class)->events();
        $scheduledCommands = collect($events)->filter(
            fn ($event): bool => collect(array_keys($expectedEvents))
                ->contains(fn (string $command): bool => str_contains(
                    $event->command,
                    $command,
                )),
        );

        $this->assertCount(3, $scheduledCommands);

        foreach ($expectedEvents as $command => $expected) {
            $matchingEvents = $scheduledCommands
                ->filter(fn ($event): bool => str_contains(
                    $event->command,
                    $command,
                ))
                ->values();

            $this->assertCount(1, $matchingEvents, "{$command} must be scheduled once.");

            $event = $matchingEvents->first();
            $this->assertSame($expected['expression'], $event->expression);
            $this->assertSame('UTC', $event->timezone);
            $this->assertTrue($event->withoutOverlapping);
            $this->assertSame($expected['expires_at'], $event->expiresAt);
        }
    }
}
