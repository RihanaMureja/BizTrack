<?php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isOwner() || $this->user()?->isCashier();
    }

    public function rules(): array
    {
        $businessId = $this->user()?->ownedBusiness?->id ?? $this->user()?->business_id;

        return [
            'customer_id' => ['nullable', 'integer', Rule::exists('customers', 'id')->where(fn ($q) => $q->where('business_id', $businessId))],
            'tax_amount' => ['prohibited'],
            'discount_amount' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'is_credit_sale' => ['boolean'],
            'apply_vat' => ['boolean'],
            'checkout_method' => ['nullable', Rule::in(['cash', 'telebirr'])],
            'checkout_phone' => ['required_if:checkout_method,telebirr', 'nullable', 'string', 'max:30'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', Rule::exists('products', 'id')->where(fn ($q) => $q->where('business_id', $businessId))],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:1000000'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $businessId = $this->user()?->ownedBusiness?->id ?? $this->user()?->business_id;
                $items = collect($this->input('items', []));
                $products = Product::query()
                    ->where('business_id', $businessId)
                    ->whereIn('id', $items->pluck('product_id'))
                    ->get(['id', 'selling_price'])
                    ->keyBy('id');

                $subtotal = $items->sum(function (array $item) use ($products): float {
                    $product = $products->get((int) $item['product_id']);

                    return $product ? (float) $product->selling_price * (int) $item['quantity'] : 0;
                });

                if ((float) $this->input('discount_amount', 0) > $subtotal) {
                    $validator->errors()->add('discount_amount', 'Discount cannot exceed the sale subtotal.');
                }
            },
        ];
    }
}
