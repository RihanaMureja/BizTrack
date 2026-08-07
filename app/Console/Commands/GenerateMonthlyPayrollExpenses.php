<?php

namespace App\Console\Commands;

use App\Models\Business;
use App\Services\ExpenseAutomationService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class GenerateMonthlyPayrollExpenses extends Command
{
    protected $signature = 'expenses:generate-payroll {--month= : Payroll month in YYYY-MM format}';

    protected $description = 'Generate monthly payroll expenses for employees with salaries.';

    public function handle(ExpenseAutomationService $expenseAutomationService): int
    {
        $month = $this->option('month')
            ? Carbon::createFromFormat('Y-m', (string) $this->option('month'))->startOfMonth()
            : now()->startOfMonth();
        $total = 0;

        Business::query()
            ->whereHas('users', fn ($query) => $query->whereNotNull('salary')->where('salary', '>', 0))
            ->each(function (Business $business) use ($expenseAutomationService, $month, &$total): void {
                $total += $expenseAutomationService->generatePayrollForBusiness($business, $month->copy());
            });

        $this->info($total.' payroll expense(s) generated for '.$month->format('F Y').'.');

        return self::SUCCESS;
    }
}
