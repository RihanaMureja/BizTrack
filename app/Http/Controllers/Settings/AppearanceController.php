<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateAppearanceThemeRequest;
use App\Services\Theme\BusinessThemeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppearanceController extends Controller
{
    public function __construct(private readonly BusinessThemeService $businessThemeService) {}

    public function edit(Request $request): Response
    {
        $business = $request->user()->ownedBusiness ?? $request->user()->business;

        return Inertia::render('settings/appearance', [
            'appearance' => [
                'business' => $business,
                'theme' => $this->businessThemeService->themeFor($business),
                'categoryPalette' => $this->businessThemeService->categoryPaletteFor($business),
            ],
        ]);
    }

    public function update(UpdateAppearanceThemeRequest $request): RedirectResponse
    {
        $business = $request->user()->ownedBusiness ?? $request->user()->business;
        abort_unless($business, 403);

        $this->businessThemeService->applyMode($business, $request->validated());

        return back()->with('success', 'Appearance updated.');
    }
}
