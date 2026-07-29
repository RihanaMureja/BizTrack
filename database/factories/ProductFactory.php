<?php

namespace Database\Factories;

use App\Enums\RecordStatus;
use App\Models\Business;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $buyPrice = fake()->randomFloat(2, 20, 800);

        return [
            'business_id' => Business::factory(),
            'category_id' => null,
            'name' => fake()->words(3, true),
            'barcode' => fake()->unique()->ean13(),
            'description' => fake()->optional()->sentence(),
            'buy_price' => $buyPrice,
            'selling_price' => $buyPrice + fake()->randomFloat(2, 5, 300),
            'unit' => fake()->randomElement(['pcs', 'box', 'pack', 'kg', 'ltr']),
            'reorder_level' => fake()->numberBetween(5, 30),
            'status' => RecordStatus::Active,
        ];
    }

    public function forBusiness(Business $business): self
    {
        return $this->state(fn (): array => [
            'business_id' => $business->id,
            'category_id' => Category::factory()->create(['business_id' => $business->id])->id,
        ]);
    }
}
