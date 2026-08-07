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
            'expiry_alert_days' => ['sometimes', 'integer', 'min:1', 'max:365'],
            'expiry_notification_frequency' => ['sometimes', 'integer', 'min:1', 'max:90'],
            'compact_sidebar' => ['boolean'],
            'credit_policy_rules' => ['sometimes', 'array', 'max:50'],
            'credit_policy_rules.*.id' => ['required', 'string', 'max:80'],
            'credit_policy_rules.*.condition' => ['required', Rule::in(['reliability_score_gte', 'overdue_count_gte', 'completed_on_time_gte'])],
            'credit_policy_rules.*.value' => ['required', 'numeric', 'min:0', 'max:1000000'],
            'credit_policy_rules.*.action' => ['required', Rule::in(['increase_limit_percent', 'decrease_limit_percent', 'freeze_limit', 'discount_percent'])],
            'credit_policy_rules.*.action_value' => ['required', 'numeric', 'min:0', 'max:1000000'],
        ];
    }
}
