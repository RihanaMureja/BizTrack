<?php

namespace Database\Factories;

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
            'phone' => fake()->optional()->phoneNumber(),
            'email' => fake()->unique()->safeEmail(),
            'address' => fake()->optional()->address(),
            'credit_limit' => $creditLimit,
            'current_balance' => fake()->randomFloat(2, 0, $creditLimit),
        ];
    }
}
