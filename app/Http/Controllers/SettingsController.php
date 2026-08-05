<?php

namespace App\Http\Controllers;

use App\Http\Requests\Settings\PreferencesUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/preferences', [
            'preferences' => $this->preferences($request->user()->preferences ?? []),
            'options' => [
                'landingPages' => [
                    ['value' => 'dashboard', 'label' => 'Dashboard'],
                    ['value' => 'sales', 'label' => 'Sales'],
                    ['value' => 'reports', 'label' => 'Reports'],
                    ['value' => 'notifications', 'label' => 'Notifications'],
                ],
                'dateFormats' => [
                    ['value' => 'Y-m-d', 'label' => '2026-07-29'],
                    ['value' => 'd/m/Y', 'label' => '29/07/2026'],
                    ['value' => 'M d, Y', 'label' => 'Jul 29, 2026'],
                ],
                'currencies' => [
                    ['value' => 'ETB', 'label' => 'ETB'],
                    ['value' => 'USD', 'label' => 'USD'],
                    ['value' => 'EUR', 'label' => 'EUR'],
                ],
            ],
        ]);
    }

    public function update(PreferencesUpdateRequest $request): RedirectResponse
    {
        $request->user()->forceFill([
            'preferences' => $this->preferences($request->validated()),
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Preferences updated.')]);

        return back();
    }

    /**
     * @param  array<string, mixed>  $preferences
     * @return array<string, mixed>
     */
    private function preferences(array $preferences): array
    {
        return [
            'default_landing_page' => $preferences['default_landing_page'] ?? 'dashboard',
            'records_per_page' => (int) ($preferences['records_per_page'] ?? 12),
            'date_format' => $preferences['date_format'] ?? 'Y-m-d',
            'currency' => $preferences['currency'] ?? 'ETB',
            'notify_low_stock' => (bool) ($preferences['notify_low_stock'] ?? true),
            'notify_payments' => (bool) ($preferences['notify_payments'] ?? true),
            'notify_credit_reminders' => (bool) ($preferences['notify_credit_reminders'] ?? true),
            'notify_stagnant_products' => (bool) ($preferences['notify_stagnant_products'] ?? true),
            'stagnant_product_days' => (int) ($preferences['stagnant_product_days'] ?? 30),
            'stagnant_product_minimum_stock' => (int) ($preferences['stagnant_product_minimum_stock'] ?? 1),
            'stagnant_product_notification_frequency' => (int) ($preferences['stagnant_product_notification_frequency'] ?? 7),
            'compact_sidebar' => (bool) ($preferences['compact_sidebar'] ?? false),
        ];
    }
}
