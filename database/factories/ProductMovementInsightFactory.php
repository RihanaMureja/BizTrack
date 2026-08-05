<?php

namespace Database\Factories;

use App\Enums\ProductInsightStatus;
use App\Enums\ProductInsightType;
use App\Models\Business;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductMovementInsightFactory extends Factory
{
    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'product_id' => Product::factory(),
            'type' => ProductInsightType::Stagnant,
            'status' => ProductInsightStatus::Open,
            'days_without_sale' => 45,
            'threshold_days' => 30,
            'stock_on_hand' => 12,
            'last_sold_at' => now()->subDays(45),
            'detected_at' => now(),
            'suggested_action' => 'Consider a small promotion or better shelf placement.',
        ];
    }
}
