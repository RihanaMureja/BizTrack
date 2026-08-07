<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;

class StoreDiscountRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === Role::Owner;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'spend_threshold' => ['required', 'numeric', 'min:0', 'max:999999999.99'],
            'discount_percent' => ['required', 'numeric', 'min:0.01', 'max:100'],
            'is_active' => ['boolean'],
        ];
    }
}
