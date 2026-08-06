<?php

namespace App\Console\Commands;

use App\Models\Business;
use App\Services\ProductInsightService;
use Illuminate\Console\Command;

class DetectExpiringProducts extends Command
{
    protected $signature = 'products:detect-expiring {business? : Optional business ID to scan}';

    protected $description = 'Detect expiring products and notify business owners.';

    public function handle(ProductInsightService $productInsightService): int
    {
        $businessId = $this->argument('business');

        $created = $businessId
            ? $productInsightService->detectExpiringForBusiness(Business::query()->findOrFail($businessId))
            : $productInsightService->detectExpiringAll();

        $this->info($created . ' expiring product insight(s) created.');

        return self::SUCCESS;
    }
}
