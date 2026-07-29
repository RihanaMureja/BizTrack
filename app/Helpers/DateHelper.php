<?php

namespace App\Helpers;

use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

class DateHelper
{
    public static function range(?string $from, ?string $to): array
    {
        $start = $from ? Carbon::parse($from)->startOfDay() : today()->subDays(29)->startOfDay();
        $end = $to ? Carbon::parse($to)->endOfDay() : today()->endOfDay();

        return [$start, $end];
    }

    public static function label(CarbonInterface $date): string
    {
        return $date->format('M j');
    }

    public static function date(?CarbonInterface $date, string $format = 'M j, Y'): string
    {
        return $date?->format($format) ?? '-';
    }

    public static function dateTime(?CarbonInterface $date, string $format = 'M j, Y g:i A'): string
    {
        return $date?->format($format) ?? '-';
    }
}
