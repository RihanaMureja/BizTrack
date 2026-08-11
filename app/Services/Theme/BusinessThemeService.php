<?php

namespace App\Services\Theme;

use App\Enums\BusinessCategory;
use App\Models\Business;
use Illuminate\Support\Facades\Storage;

class BusinessThemeService
{
    public function __construct(
        private readonly LogoPaletteExtractor $logoPaletteExtractor,
        private readonly ContrastColorService $contrastColorService,
    ) {}

    public function refreshFromLogo(Business $business): Business
    {
        if (! $business->logo) {
            return $this->applyCategoryPalette($business);
        }

        $path = Storage::disk('public')->path($business->logo);
        $palette = $this->contrastColorService->readablePalette(
            $this->logoPaletteExtractor->extract($path),
        );

        $business->forceFill([
            'theme_primary' => $palette['primary'],
            'theme_secondary' => $palette['secondary'],
            'theme_accent' => $palette['accent'],
            'theme_background' => $palette['background'],
            'theme_text' => $palette['text'],
            'theme_mode' => 'logo',
            'theme_palette_source' => 'logo',
            'theme_contrast_adjusted_at' => $palette['adjusted'] ? now() : null,
        ])->save();

        return $business->refresh();
    }

    public function themeFor(?Business $business): array
    {
        $fallback = $this->categoryPaletteFor($business);
        $primary = $business?->theme_primary ?: $fallback['primary'];

        return [
            'primary' => $primary,
            'secondary' => $business?->theme_secondary ?: $fallback['secondary'],
            'accent' => $business?->theme_accent ?: $fallback['accent'],
            'background' => $this->softBackground($primary),
            'text' => $business?->theme_text ?: '#0F172A',
            'mode' => $business?->theme_mode ?: 'default',
            'source' => $business?->theme_palette_source ?: 'default',
            'contrast_adjusted_at' => $business?->theme_contrast_adjusted_at?->toDateTimeString(),
        ];
    }

    public function applyMode(Business $business, array $data): Business
    {
        return match ($data['theme_mode']) {
            'logo' => $business->logo ? $this->refreshFromLogo($business) : $this->applyCategoryPalette($business),
            'category' => $this->applyCategoryPalette($business),
            'manual' => $this->applyManualPalette($business, $data),
            default => $this->applyFallback($business),
        };
    }

    public function categoryPaletteFor(?Business $business): array
    {
        $raw = match ($business?->business_category) {
            BusinessCategory::Boutique => ['primary' => '#7F1D3A', 'secondary' => '#1E3A5F', 'accent' => '#B45309'],
            BusinessCategory::Cosmetics => ['primary' => '#BE185D', 'secondary' => '#7C3AED', 'accent' => '#EA580C'],
            BusinessCategory::Pharmacy => ['primary' => '#047857', 'secondary' => '#0369A1', 'accent' => '#0891B2'],
            BusinessCategory::Restaurant => ['primary' => '#B91C1C', 'secondary' => '#92400E', 'accent' => '#D97706'],
            BusinessCategory::Electronics => ['primary' => '#1D4ED8', 'secondary' => '#0F766E', 'accent' => '#7C3AED'],
            BusinessCategory::OnlineStore => ['primary' => '#4F46E5', 'secondary' => '#0891B2', 'accent' => '#F97316'],
            BusinessCategory::ServiceBusiness => ['primary' => '#0F766E', 'secondary' => '#334155', 'accent' => '#CA8A04'],
            BusinessCategory::Supermarket, BusinessCategory::Wholesale => ['primary' => '#15803D', 'secondary' => '#0F766E', 'accent' => '#D97706'],
            default => ['primary' => '#009B4D', 'secondary' => '#0F766E', 'accent' => '#F59E0B'],
        };

        return $this->contrastColorService->readablePalette($raw);
    }

    private function applyCategoryPalette(Business $business): Business
    {
        $palette = $this->categoryPaletteFor($business);

        $business->forceFill([
            'theme_primary' => $palette['primary'],
            'theme_secondary' => $palette['secondary'],
            'theme_accent' => $palette['accent'],
            'theme_background' => $palette['background'],
            'theme_text' => $palette['text'],
            'theme_mode' => 'category',
            'theme_palette_source' => 'category',
            'theme_contrast_adjusted_at' => $palette['adjusted'] ? now() : null,
        ])->save();

        return $business->refresh();
    }

    private function applyManualPalette(Business $business, array $data): Business
    {
        $palette = $this->contrastColorService->readablePalette([
            'primary' => $data['theme_primary'],
            'secondary' => $data['theme_secondary'],
            'accent' => $data['theme_accent'],
        ]);

        $business->forceFill([
            'theme_primary' => $palette['primary'],
            'theme_secondary' => $palette['secondary'],
            'theme_accent' => $palette['accent'],
            'theme_background' => $palette['background'],
            'theme_text' => $palette['text'],
            'theme_mode' => 'manual',
            'theme_palette_source' => 'manual',
            'theme_contrast_adjusted_at' => $palette['adjusted'] ? now() : null,
        ])->save();

        return $business->refresh();
    }

    private function applyFallback(Business $business): Business
    {
        $palette = $this->contrastColorService->readablePalette([]);

        $business->forceFill([
            'theme_primary' => $palette['primary'],
            'theme_secondary' => $palette['secondary'],
            'theme_accent' => $palette['accent'],
            'theme_background' => $palette['background'],
            'theme_text' => $palette['text'],
            'theme_mode' => 'default',
            'theme_palette_source' => 'default',
            'theme_contrast_adjusted_at' => $palette['adjusted'] ? now() : null,
        ])->save();

        return $business->refresh();
    }

    private function softBackground(string $hex): string
    {
        $hex = ltrim($hex, '#');

        if (! preg_match('/^[A-Fa-f0-9]{6}$/', $hex)) {
            return '#F8FAFC';
        }

        $rgb = [
            hexdec(substr($hex, 0, 2)),
            hexdec(substr($hex, 2, 2)),
            hexdec(substr($hex, 4, 2)),
        ];

        $mixed = array_map(fn (int $value): int => (int) round($value * 0.04 + 255 * 0.96), $rgb);

        return sprintf('#%02X%02X%02X', $mixed[0], $mixed[1], $mixed[2]);
    }
}
