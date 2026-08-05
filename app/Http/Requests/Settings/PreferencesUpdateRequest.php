<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PreferencesUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'default_landing_page' => ['required', Rule::in(['dashboard', 'sales', 'reports', 'notifications'])],
            'records_per_page' => ['required', 'integer', 'min:10', 'max:100'],
            'date_format' => ['required', Rule::in(['Y-m-d', 'd/m/Y', 'M d, Y'])],
            'currency' => ['required', Rule::in(['ETB', 'USD', 'EUR'])],
            'notify_low_stock' => ['boolean'],
            'notify_payments' => ['boolean'],
            'notify_credit_reminders' => ['boolean'],
            'notify_stagnant_products' => ['boolean'],
            'stagnant_product_days' => ['sometimes', 'integer', 'min:1', 'max:365'],
            'stagnant_product_minimum_stock' => ['sometimes', 'integer', 'min:0', 'max:999999'],
            'stagnant_product_notification_frequency' => ['sometimes', 'integer', 'min:1', 'max:90'],
            'compact_sidebar' => ['boolean'],
        ];
    }
}
