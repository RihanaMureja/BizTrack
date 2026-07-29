<?php

namespace Database\Seeders;

use App\Enums\RecordStatus;
use App\Models\Business;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * @var list<array{name: string, barcode: string, buy_price: float, selling_price: float, unit: string, reorder_level: int}>
     */
    private const PRODUCTS = [
        ['name' => 'Bottled Water 500ml', 'barcode' => 'BT500001', 'buy_price' => 8, 'selling_price' => 12, 'unit' => 'bottle', 'reorder_level' => 20],
        ['name' => 'Premium Coffee 250g', 'barcode' => 'CF250001', 'buy_price' => 180, 'selling_price' => 240, 'unit' => 'pack', 'reorder_level' => 8],
        ['name' => 'Notebook A5', 'barcode' => 'NB500001', 'buy_price' => 35, 'selling_price' => 55, 'unit' => 'pcs', 'reorder_level' => 15],
        ['name' => 'USB-C Cable', 'barcode' => 'UC100001', 'buy_price' => 95, 'selling_price' => 150, 'unit' => 'pcs', 'reorder_level' => 10],
    ];

    public function run(): void
    {
        Business::query()->each(function (Business $business): void {
            $category = Category::query()
                ->where('business_id', $business->id)
                ->orderBy('name')
                ->first();

            foreach (self::PRODUCTS as $product) {
                Product::updateOrCreate(
                    ['business_id' => $business->id, 'barcode' => $product['barcode']],
                    [
                        ...$product,
                        'category_id' => $category?->id,
                        'description' => 'Starter catalog item for business setup.',
                        'status' => RecordStatus::Active,
                    ],
                );
            }
        });
    }
}
