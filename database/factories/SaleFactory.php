<?php

namespace Database\Factories;

use App\Enums\SaleStatus;
use App\Models\Business;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Sale> */
class SaleFactory extends Factory
{
    protected $model = Sale::class;

    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'customer_id' => null,
            'user_id' => User::factory(),
            'invoice_number' => 'INV-TEST-'.fake()->unique()->numerify('####'),
            'subtotal' => 100,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'grand_total' => 100,
            'status' => SaleStatus::Completed,
            'sold_at' => now(),
        ];
    }
}
