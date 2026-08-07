<?php

namespace Database\Factories;

use App\Enums\ExpenseSource;
use App\Enums\ExpenseStatus;
use App\Models\Business;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Expense> */
class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'expense_category_id' => ExpenseCategory::factory(),
            'user_id' => User::factory(),
            'title' => fake()->sentence(3),
            'amount' => fake()->randomFloat(2, 10, 2000),
            'expense_date' => today(),
            'status' => ExpenseStatus::Approved,
            'source' => ExpenseSource::Manual,
            'source_reference_type' => null,
            'source_reference_id' => null,
            'source_period' => null,
            'vendor' => fake()->optional()->company(),
            'receipt_path' => null,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
