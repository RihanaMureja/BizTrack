<?php

namespace App\Services\Theme;

class LogoPaletteExtractor
{
    public function extract(string $path): array
    {
        if (! function_exists('imagecreatefromstring') || ! is_file($path)) {
            return $this->fallback();
        }

        $contents = file_get_contents($path);
        $image = $contents ? @imagecreatefromstring($contents) : false;

        if (! $image) {
            return $this->fallback();
        }

        $width = imagesx($image);
        $height = imagesy($image);
        $stepX = max(1, (int) floor($width / 32));
        $stepY = max(1, (int) floor($height / 32));
        $buckets = [];

        for ($y = 0; $y < $height; $y += $stepY) {
            for ($x = 0; $x < $width; $x += $stepX) {
                $index = imagecolorat($image, $x, $y);
                $color = imagecolorsforindex($image, $index);
                $r = (int) round($color['red'] / 32) * 32;
                $g = (int) round($color['green'] / 32) * 32;
                $b = (int) round($color['blue'] / 32) * 32;

                if ($this->isNoise($r, $g, $b)) {
                    continue;
                }

                $hex = sprintf('#%02X%02X%02X', min($r, 255), min($g, 255), min($b, 255));
                $buckets[$hex] = ($buckets[$hex] ?? 0) + 1;
            }
        }

        imagedestroy($image);
        arsort($buckets);
        $colors = array_keys($buckets);

        return [
            'primary' => $colors[0] ?? '#009B4D',
            'secondary' => $colors[1] ?? '#0F766E',
            'accent' => $colors[2] ?? '#F59E0B',
        ];
    }

    private function fallback(): array
    {
        return ['primary' => '#009B4D', 'secondary' => '#0F766E', 'accent' => '#F59E0B'];
    }

    private function isNoise(int $r, int $g, int $b): bool
    {
        $max = max($r, $g, $b);
        $min = min($r, $g, $b);

        return $max > 238 || $max < 18 || ($max - $min) < 14;
    }
}
