<?php

namespace App\Console\Commands;

use App\Models\Business;
use App\Services\ProductInsightService;
use Illuminate\Console\Command;

class DetectStagnantProducts extends Command
{
    protected $signature = 'products:detect-stagnant {business? : Optional business ID to scan}';

    protected $description = 'Detect stagnant products and notify business owners.';

    public function handle(ProductInsightService $productInsightService): int
    {
        $businessId = $this->argument('business');

        $created = $businessId
            ? $productInsightService->detectForBusiness(Business::query()->findOrFail($businessId))
            : $productInsightService->detectAll();

        $this->info($created.' stagnant product insight(s) created.');

        return self::SUCCESS;
    }
}
