<?php

namespace App\Http\Requests;

use App\Enums\ProductInsightStatus;
use App\Enums\ProductInsightType;
use App\Models\ProductMovementInsight;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreStagnantProductDiscountRequest extends FormRequest
{
    public function authorize(): bool
    {
        $insight = $this->route('productMovementInsight');
        $businessId = $this->user()?->ownedBusiness?->id ?? $this->user()?->business_id;

        return $insight instanceof ProductMovementInsight
            && $businessId !== null
            && $insight->business_id === $businessId
            && $this->user()?->isOwner();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'discount_price' => ['required', 'numeric', 'min:0.01', 'max:999999999.99'],
            'allow_below_cost' => ['boolean'],
            'discount_reason' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                /** @var ProductMovementInsight|null $insight */
                $insight = $this->route('productMovementInsight');
                $insight?->loadMissing('product.latestAvailableBatch');
                $product = $insight?->product;
                $batch = $product?->latestAvailableBatch;

                if (! $insight || $insight->type !== ProductInsightType::Stagnant || $insight->status !== ProductInsightStatus::Open) {
                    $validator->errors()->add('discount_price', 'Discounts can only be applied to open stagnant product insights.');

                    return;
                }

                if (! $batch || (float) $batch->selling_price <= 0) {
                    $validator->errors()->add('discount_price', 'Restock this product with a selling price before applying a stagnant discount.');

                    return;
                }

                $discountPrice = (float) $this->input('discount_price');
                $regularPrice = (float) $batch->selling_price;
                $unitCost = (float) $batch->unit_cost;
                $allowsBelowCost = (bool) $this->boolean('allow_below_cost');
                $reason = trim((string) $this->input('discount_reason', ''));

                if ($discountPrice >= $regularPrice) {
                    $validator->errors()->add('discount_price', 'Discount price must be lower than the current selling price.');
                }

                if ($discountPrice < $unitCost && ! $allowsBelowCost) {
                    $validator->errors()->add('discount_price', 'Discount price cannot go below unit cost unless the below-cost override is confirmed.');
                }

                if ($discountPrice < $unitCost && $allowsBelowCost && $reason === '') {
                    $validator->errors()->add('discount_reason', 'Explain why this product is being sold below cost.');
                }
            },
        ];
    }
}
