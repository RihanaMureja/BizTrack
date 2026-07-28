<?php

namespace Database\Factories;

use App\Enums\InventoryTransactionType;
use App\Models\Business;
use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryTransaction>
 */
class InventoryTransactionFactory extends Factory
{
    protected $model = InventoryTransaction::class;

    public function definition(): array
    {
        $product = Product::factory()->create();
        $inventory = $product->inventory;
        $before = fake()->numberBetween(0, 50);
        $change = fake()->numberBetween(1, 20);

        return [
            'inventory_id' => $inventory->id,
            'product_id' => $product->id,
            'business_id' => $product->business_id,
            'user_id' => User::factory(),
            'type' => InventoryTransactionType::Restock,
            'quantity_change' => $change,
            'quantity_before' => $before,
            'quantity_after' => $before + $change,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
