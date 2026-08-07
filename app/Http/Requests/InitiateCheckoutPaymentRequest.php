<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InitiateCheckoutPaymentRequest extends FormRequest
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
        return [
            'method' => ['required', Rule::in([PaymentMethod::Cash->value, PaymentMethod::Telebirr->value])],
            'amount' => ['nullable', 'numeric', 'min:0.01', 'max:99999999.99'],
            'phone' => ['required_if:method,'.PaymentMethod::Telebirr->value, 'nullable', 'string', 'max:30'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
