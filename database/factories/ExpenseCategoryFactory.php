<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\ExpenseCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExpenseCategory> */
class ExpenseCategoryFactory extends Factory
{
    protected $model = ExpenseCategory::class;

    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'name' => fake()->unique()->randomElement(['Rent', 'Utilities', 'Transport', 'Supplies', 'Marketing']).' '.fake()->unique()->numerify('###'),
            'description' => fake()->optional()->sentence(),
        ];
    }
}
