<?php

namespace App\Http\Requests;

use App\Concerns\PasswordValidationRules;
use App\Enums\BusinessPermissionKey;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CashierRequest extends FormRequest
{
    use PasswordValidationRules;

    public function authorize(): bool
    {
        return $this->user()?->hasBusinessPermission(BusinessPermissionKey::ManageEmployees) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $cashier = $this->route('cashier');
        $businessId = $this->user()?->ownedBusiness?->id ?? $this->user()?->business_id;

        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($cashier)],
            'business_role_id' => ['nullable', 'integer', Rule::exists('business_roles', 'id')->where('business_id', $businessId)],
            'phone' => ['nullable', 'string', 'max:20'],
            'salary' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'password' => $cashier
                ? ['nullable', ...array_slice($this->passwordRules(), 1)]
                : $this->passwordRules(),
        ];
    }
}
