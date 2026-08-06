<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use Illuminate\Validation\Rule;

class CheckoutSaleRequest extends StoreSaleRequest
{
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'amount_received' => ['required', 'numeric', 'min:0.01', 'max:99999999.99'],
            'enable_credit' => ['required', 'boolean'],
            'discount_type' => ['nullable', Rule::in(['percentage', 'fixed', 'buy_x_get_y', 'manual'])],
            'discount_value' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'payment_reference' => ['nullable', 'string', 'max:120'],
            'payment_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
