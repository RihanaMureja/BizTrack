<?php

namespace Database\Factories;

use App\Enums\CustomerType;
use App\Models\Business;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        $creditLimit = fake()->randomFloat(2, 500, 10000);

        return [
            'business_id' => Business::factory(),
            'full_name' => fake()->name(),
            'customer_type' => fake()->randomElement(CustomerType::cases()),
            'company_name' => fake()->optional(0.3)->company(),
            'phone' => fake()->optional()->phoneNumber(),
            'email' => fake()->unique()->safeEmail(),
            'address' => fake()->optional()->address(),
            'credit_limit' => $creditLimit,
            'default_discount' => fake()->optional(0.3)->randomFloat(2, 0, 15) ?? 0,
            'current_balance' => fake()->randomFloat(2, 0, $creditLimit),
        ];
    }
}
