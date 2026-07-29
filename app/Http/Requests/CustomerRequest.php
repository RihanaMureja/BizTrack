<?php

namespace App\Http\Requests;

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
    public function rules(): array
    {
        $businessId = $this->user()?->ownedBusiness?->id ?? $this->user()?->business_id;
        $customer = $this->route('customer');

        return [
            'full_name' => ['required', 'string', 'max:150'],
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
            'credit_limit' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'current_balance' => ['required', 'numeric', 'min:0', 'max:99999999.99', 'lte:credit_limit'],
        ];
    }
}
