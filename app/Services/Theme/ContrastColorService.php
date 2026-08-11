<?php

namespace App\Services\Theme;

class ContrastColorService
{
    public function readablePalette(array $colors): array
    {
        $primary = $this->normalize($colors['primary'] ?? '#009B4D');
        $secondary = $this->normalize($colors['secondary'] ?? '#0F766E');
        $accent = $this->normalize($colors['accent'] ?? '#F59E0B');
        $background = $this->mix($primary, '#FFFFFF', 0.96);
        $text = '#0F172A';
        $adjusted = false;

        foreach (['primary' => $primary, 'secondary' => $secondary, 'accent' => $accent] as $name => $color) {
            if ($this->contrastRatio($color, '#FFFFFF') < 4.5) {
                $$name = $this->darkenUntilReadable($color, '#FFFFFF');
                $adjusted = true;
            }
        }

        return compact('primary', 'secondary', 'accent', 'background', 'text', 'adjusted');
    }

    private function normalize(string $hex): string
    {
        $hex = strtoupper(ltrim($hex, '#'));

        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        return preg_match('/^[A-F0-9]{6}$/', $hex) ? '#'.$hex : '#009B4D';
    }

    private function darkenUntilReadable(string $hex, string $against): string
    {
        $rgb = $this->hexToRgb($hex);

        for ($step = 0; $step < 16; $step++) {
            $candidate = $this->rgbToHex($rgb);

            if ($this->contrastRatio($candidate, $against) >= 4.5) {
                return $candidate;
            }

            $rgb = [
                max(0, (int) round($rgb[0] * 0.88)),
                max(0, (int) round($rgb[1] * 0.88)),
                max(0, (int) round($rgb[2] * 0.88)),
            ];
        }

        return '#0F172A';
    }

    private function contrastRatio(string $a, string $b): float
    {
        $light = max($this->luminance($a), $this->luminance($b));
        $dark = min($this->luminance($a), $this->luminance($b));

        return ($light + 0.05) / ($dark + 0.05);
    }

    private function luminance(string $hex): float
    {
        $rgb = array_map(fn (int $value): float => $value / 255, $this->hexToRgb($hex));
        $channels = array_map(fn (float $channel): float => $channel <= 0.03928 ? $channel / 12.92 : (($channel + 0.055) / 1.055) ** 2.4, $rgb);

        return 0.2126 * $channels[0] + 0.7152 * $channels[1] + 0.0722 * $channels[2];
    }

    private function hexToRgb(string $hex): array
    {
        $hex = ltrim($hex, '#');

        return [
            hexdec(substr($hex, 0, 2)),
            hexdec(substr($hex, 2, 2)),
            hexdec(substr($hex, 4, 2)),
        ];
    }

    private function rgbToHex(array $rgb): string
    {
        return sprintf('#%02X%02X%02X', $rgb[0], $rgb[1], $rgb[2]);
    }

    private function mix(string $from, string $to, float $weight): string
    {
        $fromRgb = $this->hexToRgb($from);
        $toRgb = $this->hexToRgb($to);

        return $this->rgbToHex([
            (int) round($fromRgb[0] * (1 - $weight) + $toRgb[0] * $weight),
            (int) round($fromRgb[1] * (1 - $weight) + $toRgb[1] * $weight),
            (int) round($fromRgb[2] * (1 - $weight) + $toRgb[2] * $weight),
        ]);
    }
}
