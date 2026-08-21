<?php

namespace App\Services;

use App\Enums\ProductInsightStatus;
use App\Enums\ProductInsightType;
use App\Models\Product;
use App\Models\ProductMovementInsight;

class ProductPricingService
{
    /**
     * @return array{unit_cost: float, regular_price: float, effective_price: float, is_discounted: bool, discount_price: float|null, discount_percent: float|null, discount_reason: string|null, allow_below_cost: bool, insight_id: int|null}
     */
    public function priceFor(Product $product): array
    {
        $product->loadMissing(['latestAvailableBatch', 'movementInsights']);

        $unitCost = (float) ($product->latestAvailableBatch?->unit_cost ?? 0);
        $regularPrice = (float) ($product->latestAvailableBatch?->selling_price ?? 0);
        $insight = $this->activeDiscountInsight($product);
        $discountPrice = $insight?->discount_price !== null ? (float) $insight->discount_price : null;
        $allowBelowCost = (bool) ($insight?->allow_below_cost ?? false);
        $discountIsSafe = $discountPrice !== null
            && $discountPrice > 0
            && $discountPrice < $regularPrice
            && ($allowBelowCost || $discountPrice >= $unitCost);

        return [
            'unit_cost' => $unitCost,
            'regular_price' => $regularPrice,
            'effective_price' => $discountIsSafe ? $discountPrice : $regularPrice,
            'is_discounted' => $discountIsSafe,
            'discount_price' => $discountIsSafe ? $discountPrice : null,
            'discount_percent' => $discountIsSafe ? (float) ($insight?->discount_percent ?? 0) : null,
            'discount_reason' => $discountIsSafe ? $insight?->discount_reason : null,
            'allow_below_cost' => $discountIsSafe && $allowBelowCost,
            'insight_id' => $discountIsSafe ? $insight?->id : null,
        ];
    }

    private function activeDiscountInsight(Product $product): ?ProductMovementInsight
    {
        return $product->movementInsights
            ->first(fn (ProductMovementInsight $insight): bool => $insight->type === ProductInsightType::Stagnant
                && $insight->status === ProductInsightStatus::Open
                && $insight->discount_applied_at !== null
                && $insight->discount_price !== null);
    }
}
