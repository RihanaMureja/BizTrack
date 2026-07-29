<?php

namespace App\Helpers;

class CurrencyHelper
{
    public static function money(float|int|string|null $amount, string $currency = 'ETB'): string
    {
        return number_format((float) ($amount ?? 0), 2).' '.$currency;
    }

    public static function compact(float|int|string|null $amount, string $currency = 'ETB'): string
    {
        $value = (float) ($amount ?? 0);

        return match (true) {
            abs($value) >= 1_000_000 => number_format($value / 1_000_000, 1).'M '.$currency,
            abs($value) >= 1_000 => number_format($value / 1_000, 1).'K '.$currency,
            default => self::money($value, $currency),
        };
    }
}
