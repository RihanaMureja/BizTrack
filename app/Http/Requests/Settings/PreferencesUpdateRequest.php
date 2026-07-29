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
            'compact_sidebar' => ['boolean'],
        ];
    }
}
