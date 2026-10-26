<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Process session transitions within five minutes; extend the slot horizon daily.
Schedule::command('sessions:expire')
    ->everyFiveMinutes()
    ->timezone('UTC')
    ->withoutOverlapping(15);

Schedule::command('sessions:autocomplete')
    ->everyFiveMinutes()
    ->timezone('UTC')
    ->withoutOverlapping(15);

Schedule::command('slots:generate')
    ->dailyAt('00:05')
    ->timezone('UTC')
    ->withoutOverlapping(120);
