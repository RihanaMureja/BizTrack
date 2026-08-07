<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\DiscountRule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DiscountRule>
 */
class DiscountRuleFactory extends Factory
{
    protected $model = DiscountRule::class;

    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'name' => fake()->words(3, true),
            'spend_threshold' => fake()->randomFloat(2, 500, 10000),
            'discount_percent' => fake()->randomFloat(2, 1, 20),
            'is_active' => true,
        ];
    }
}
