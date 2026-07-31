<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\BusinessRole;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BusinessRole>
 */
class BusinessRoleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'name' => fake()->unique()->randomElement(['Cashier', 'Manager', 'Inventory Staff', 'Payment Clerk', 'Sales Clerk']),
            'description' => fake()->sentence(),
            'is_default' => false,
        ];
    }
}
