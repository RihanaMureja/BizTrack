<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * @var list<array{name: string, description: string}>
     */
    private const DEFAULT_CATEGORIES = [
        ['name' => 'Beverages', 'description' => 'Soft drinks, juices, and bottled water.'],
        ['name' => 'Groceries', 'description' => 'Everyday household and pantry items.'],
        ['name' => 'Electronics', 'description' => 'Small electronics and accessories.'],
        ['name' => 'Personal Care', 'description' => 'Health, beauty, and hygiene products.'],
    ];

    public function run(): void
    {
        Business::query()->each(function (Business $business): void {
            foreach (self::DEFAULT_CATEGORIES as $category) {
                Category::updateOrCreate(
                    ['business_id' => $business->id, 'name' => $category['name']],
                    $category,
                );
            }
        });
    }
}
