<?php

namespace Database\Factories;

use App\Enums\RecordStatus;
use App\Models\Subscription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subscription>
 */
class SubscriptionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Starter', 'Growth', 'Pro']),
            'price' => fake()->randomElement([0, 499, 999, 1999]),
            'duration_months' => 1,
            'max_cashiers' => fake()->numberBetween(1, 10),
            'description' => fake()->sentence(),
            'status' => RecordStatus::Active,
        ];
    }
}
