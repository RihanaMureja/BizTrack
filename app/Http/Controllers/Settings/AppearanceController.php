<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\AppearanceUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppearanceController extends Controller
{
    /**
     * Show the owner's appearance settings.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $business = $user?->ownedBusiness;

        return Inertia::render('settings/appearance', [
            'brandColor' => $business?->brand_color ?? null,
            'canManageBrandColor' => (bool) $user?->isOwner() && $business !== null,
        ]);
    }

    /**
     * Save the business owner's brand color.
     */
    public function update(AppearanceUpdateRequest $request): RedirectResponse
    {
        $business = $request->user()->ownedBusiness;

        abort_unless($business, 403);

        $business->forceFill([
            'brand_color' => $request->validated('brand_color'),
        ])->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Brand color updated.'),
        ]);

        return back();
    }
}
