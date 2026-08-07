<?php

namespace App\Http\Requests;

use App\Enums\CustomerType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isOwner() || $this->user()?->isCashier();
    }

    /**
     * @return array<string, mixed>
     */
    protected function prepareForValidation(): void
    {
        $displayName = $this->input('display_name') ?: $this->input('full_name');

        if ($displayName) {
            $this->merge([
                'customer_type' => $this->input('customer_type') ?: CustomerType::Individual->value,
                'display_name' => $displayName,
            ]);
        }
    }

    public function rules(): array
    {
        $businessId = $this->user()?->ownedBusiness?->id ?? $this->user()?->business_id;
        $customer = $this->route('customer');

        return [
            'customer_type' => ['required', Rule::enum(CustomerType::class)],
            'display_name' => ['required', 'string', 'max:150'],
            'full_name' => ['nullable', 'string', 'max:150'],
            'contact_person' => [
                Rule::requiredIf(fn (): bool => in_array($this->input('customer_type'), [
                    CustomerType::Company->value,
                    CustomerType::Government->value,
                ], true)),
                'nullable',
                'string',
                'max:150',
            ],
            'contact_person_phone' => ['nullable', 'string', 'max:20'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => [
                'nullable',
                'email',
                'max:150',
                Rule::unique('customers', 'email')
                    ->where(fn ($query) => $query->where('business_id', $businessId))
                    ->ignore($customer),
            ],
            'address' => ['nullable', 'string', 'max:1000'],
            'credit_limit' => ['prohibited'],
            'current_balance' => ['prohibited'],
        ];
    }
}
