<?php

namespace App\Http\Requests;

use App\Models\Product;
use App\Services\ProductPricingService;
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
            'cash_amount' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'credit_amount' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'apply_vat' => ['boolean'],
            'checkout_method' => ['nullable', Rule::in(['cash', 'telebirr'])],
            'checkout_phone' => ['required_if:checkout_method,telebirr', 'nullable', 'string', 'max:30'],
            'payment_lines' => ['nullable', 'array'],
            'payment_lines.*.method' => ['required_with:payment_lines', Rule::in(['cash', 'telebirr', 'mpesa', 'cbebirr', 'apollo', 'credit'])],
            'payment_lines.*.amount' => ['required_with:payment_lines', 'numeric', 'min:0', 'max:99999999.99'],
            'payment_lines.*.phone' => ['nullable', 'string', 'max:30'],
            'payment_lines.*.account_number' => ['nullable', 'string', 'max:60'],
            'payment_lines.*.reference' => ['nullable', 'string', 'max:120'],
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
                    ->with(['latestAvailableBatch', 'movementInsights'])
                    ->where('business_id', $businessId)
                    ->whereIn('id', $items->pluck('product_id'))
                    ->get(['id'])
                    ->keyBy('id');

                $pricingService = app(ProductPricingService::class);

                $subtotal = $items->sum(function (array $item) use ($products, $pricingService): float {
                    $product = $products->get((int) $item['product_id']);

                    return $product ? $pricingService->priceFor($product)['effective_price'] * (int) $item['quantity'] : 0;
                });

                $unpricedProduct = $products->first(fn (Product $product): bool => $pricingService->priceFor($product)['effective_price'] <= 0);

                if ($unpricedProduct) {
                    $validator->errors()->add('items', 'Restock selected products with a selling price before selling them.');
                }

                if ((float) $this->input('discount_amount', 0) > $subtotal) {
                    $validator->errors()->add('discount_amount', 'Discount cannot exceed the sale subtotal.');
                }

                foreach ($this->input('payment_lines', []) as $index => $line) {
                    $method = $line['method'] ?? null;
                    $amount = (float) ($line['amount'] ?? 0);

                    if ($amount <= 0) {
                        continue;
                    }

                    if (in_array($method, ['telebirr', 'mpesa', 'cbebirr'], true) && blank($line['phone'] ?? null)) {
                        $validator->errors()->add("payment_lines.$index.phone", 'Enter the customer phone number for this wallet payment.');
                    }

                    if ($method === 'apollo' && blank($line['account_number'] ?? null)) {
                        $validator->errors()->add("payment_lines.$index.account_number", 'Enter the Apollo account number for this payment.');
                    }
                }
            },
        ];
    }
}
