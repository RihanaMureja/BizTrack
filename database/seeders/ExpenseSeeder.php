<?php

namespace Database\Seeders;

use App\Enums\ExpenseStatus;
use App\Models\Business;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Database\Seeder;

class ExpenseSeeder extends Seeder
{
    private const CATEGORIES = [
        ['name' => 'Rent', 'description' => 'Shop or office rent.'],
        ['name' => 'Utilities', 'description' => 'Electricity, water, internet, and phone bills.'],
        ['name' => 'Transport', 'description' => 'Delivery, fuel, and local transport costs.'],
        ['name' => 'Supplies', 'description' => 'Packaging, stationery, and operational supplies.'],
    ];

    public function run(): void
    {
        Business::query()->each(function (Business $business): void {
            foreach (self::CATEGORIES as $category) {
                ExpenseCategory::updateOrCreate(
                    ['business_id' => $business->id, 'name' => $category['name']],
                    $category,
                );
            }

            $category = ExpenseCategory::query()->where('business_id', $business->id)->first();

            if ($category) {
                Expense::updateOrCreate(
                    ['business_id' => $business->id, 'title' => 'Sample monthly utility bill'],
                    [
                        'expense_category_id' => $category->id,
                        'user_id' => $business->owner_id,
                        'amount' => 850,
                        'expense_date' => today(),
                        'status' => ExpenseStatus::Approved,
                        'vendor' => 'Utility provider',
                    ],
                );
            }
        });
    }
}
