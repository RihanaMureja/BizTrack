<?php

namespace Database\Seeders;

use App\Enums\RecordStatus;
use App\Models\Business;
use App\Models\Category;
use App\Models\Product;
use App\Services\ProductCodeGeneratorService;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * @var list<array{name: string, buy_price: float, selling_price: float, unit: string, reorder_level: int}>
     */
    private const PRODUCTS = [
        ['name' => 'Bottled Water 500ml', 'buy_price' => 8, 'selling_price' => 12, 'unit' => 'bottle', 'reorder_level' => 20],
        ['name' => 'Premium Coffee 250g', 'buy_price' => 180, 'selling_price' => 240, 'unit' => 'pack', 'reorder_level' => 8],
        ['name' => 'Notebook A5', 'buy_price' => 35, 'selling_price' => 55, 'unit' => 'pcs', 'reorder_level' => 15],
        ['name' => 'USB-C Cable', 'buy_price' => 95, 'selling_price' => 150, 'unit' => 'pcs', 'reorder_level' => 10],
    ];

    public function run(): void
    {
        Business::query()->each(function (Business $business): void {
            $generator = app(ProductCodeGeneratorService::class);
            $category = Category::query()
                ->where('business_id', $business->id)
                ->orderBy('name')
                ->first();

            foreach (self::PRODUCTS as $product) {
                $existing = Product::query()
                    ->where('business_id', $business->id)
                    ->where('name', $product['name'])
                    ->first();
                $barcode = $existing?->barcode ?? $generator->barcodeFor($business);

                Product::updateOrCreate(
                    ['business_id' => $business->id, 'name' => $product['name']],
                    [
                        ...$product,
                        'barcode' => $barcode,
                        'qr_payload' => $existing?->qr_payload ?? $generator->qrPayloadFor($business, $barcode),
                        'category_id' => $category?->id,
                        'description' => 'Starter catalog item for business setup.',
                        'status' => RecordStatus::Active,
                    ],
                );
            }
        });
    }
}
