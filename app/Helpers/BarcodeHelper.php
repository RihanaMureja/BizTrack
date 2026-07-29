<?php

namespace App\Helpers;

class BarcodeHelper
{
    public static function normalize(?string $barcode): ?string
    {
        $normalized = preg_replace('/[^A-Za-z0-9]/', '', (string) $barcode);

        return $normalized === '' ? null : strtoupper($normalized);
    }

    public static function generateSku(string $name, ?int $id = null): string
    {
        $prefix = str($name)
            ->ascii()
            ->upper()
            ->replaceMatches('/[^A-Z0-9]+/', '')
            ->substr(0, 4)
            ->padRight(4, 'X')
            ->toString();

        return $prefix.'-'.str_pad((string) ($id ?? random_int(1, 999999)), 6, '0', STR_PAD_LEFT);
    }

    public static function isValidEan13(string $barcode): bool
    {
        $barcode = self::normalize($barcode);

        if (! $barcode || ! preg_match('/^\d{13}$/', $barcode)) {
            return false;
        }

        $digits = array_map('intval', str_split($barcode));
        $checkDigit = array_pop($digits);
        $sum = collect($digits)
            ->map(fn (int $digit, int $index): int => $digit * ($index % 2 === 0 ? 1 : 3))
            ->sum();

        return (10 - ($sum % 10)) % 10 === $checkDigit;
    }
}
