<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\AppearanceUpdateRequest;
use Illuminate\Support\Facades\Schema;
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
        $brandColor = $business?->brand_color
            ?? ($user?->preferences['brand_color'] ?? null);

        return Inertia::render('settings/appearance', [
            'brandColor' => $brandColor,
            'canManageBrandColor' => (bool) $user?->isOwner() && $business !== null,
        ]);
    }

    /**
     * Save the business owner's brand color.
     */
    public function update(AppearanceUpdateRequest $request): RedirectResponse
    {
        $business = $request->user()->ownedBusiness;
        $user = $request->user();

        abort_unless($business, 403);

        $brandColor = $request->validated('brand_color');

        if (Schema::hasColumn($business->getTable(), 'brand_color')) {
            $business->forceFill([
                'brand_color' => $brandColor,
            ])->save();
        } else {
            $preferences = $user->preferences ?? [];

            if ($brandColor === null || $brandColor === '') {
                unset($preferences['brand_color']);
            } else {
                $preferences['brand_color'] = $brandColor;
            }

            $user->forceFill([
                'preferences' => $preferences,
            ])->save();
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Brand color updated.'),
        ]);

        return back();
    }
}
