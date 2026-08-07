<?php

namespace App\Console\Commands;

use App\Models\Business;
use App\Services\CustomerCreditPolicyService;
use App\Services\CustomerCreditService;
use Illuminate\Console\Command;

class EvaluateCustomerCreditPolicies extends Command
{
    protected $signature = 'customers:evaluate-credit-policy {business? : Optional business ID to evaluate}';

    protected $description = 'Mark past-due credits and re-evaluate customer credit policies.';

    public function handle(CustomerCreditService $creditService, CustomerCreditPolicyService $policyService): int
    {
        $businesses = Business::query()
            ->when($this->argument('business'), fn ($query, $businessId) => $query->whereKey($businessId))
            ->get();

        foreach ($businesses as $business) {
            $creditService->markPastDueCreditsForBusiness($business);
            $business->customers()->each(fn ($customer) => $policyService->evaluate($customer));
        }

        $this->info('Customer credit policies evaluated for '.$businesses->count().' business(es).');

        return self::SUCCESS;
    }
}
