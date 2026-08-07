<?php

namespace App\Console\Commands;

use App\Models\Business;
use App\Services\ProductService;
use Illuminate\Console\Command;

class DetectStagnantProducts extends Command
{
    protected $signature = 'products:detect-stagnant {business? : Optional business ID to scan}';

    protected $description = 'Detect stagnant products and notify business owners.';

    public function handle(ProductService $productService): int
    {
        $businessId = $this->argument('business');

        $created = $businessId
            ? $productService->detectForBusiness(Business::query()->findOrFail($businessId))
            : $productService->detectAll();

        $this->info($created.' stagnant product insight(s) created.');

        return self::SUCCESS;
    }
}
