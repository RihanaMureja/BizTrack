<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\InventoryBatch;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryBatch>
 */
class InventoryBatchFactory extends Factory
{
    protected $model = InventoryBatch::class;

    public function definition(): array
    {
        $quantity = fake()->numberBetween(5, 100);

        return [
            'product_id' => Product::factory(),
            'business_id' => Business::factory(),
            'batch_number' => 'LOT-'.fake()->unique()->numerify('######'),
            'quantity_received' => $quantity,
            'quantity_remaining' => $quantity,
            'unit_cost' => fake()->randomFloat(2, 10, 500),
            'received_at' => now(),
            'expiry_date' => fake()->optional()->dateTimeBetween('+1 month', '+2 years'),
        ];
    }
}
