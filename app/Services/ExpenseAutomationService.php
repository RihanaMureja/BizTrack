<?php

namespace App\Services;

use App\Enums\ExpenseSource;
use App\Enums\ExpenseStatus;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\InventoryBatch;
use App\Models\User;
use Illuminate\Support\Carbon;

class ExpenseAutomationService
{
    public function recordRestock(InventoryBatch $batch, ?User $user = null): Expense
    {
        $batch->loadMissing('product', 'business');

        $category = $this->category($batch->business, 'Inventory Restock', 'Automatically generated from stock restocks.');
        $amount = (float) $batch->quantity_received * (float) $batch->unit_cost;

        return Expense::updateOrCreate(
            [
                'business_id' => $batch->business_id,
                'source' => ExpenseSource::Restock,
                'source_reference_type' => InventoryBatch::class,
                'source_reference_id' => $batch->id,
            ],
            [
                'expense_category_id' => $category->id,
                'user_id' => $user?->id,
                'title' => 'Restock: '.$batch->product->name.' ('.$batch->batch_number.')',
                'amount' => $amount,
                'expense_date' => ($batch->received_at ?? now())->toDateString(),
                'status' => ExpenseStatus::Paid,
                'vendor' => null,
                'notes' => 'Auto-generated from inventory batch '.$batch->batch_number.'.',
            ],
        )->refresh();
    }

    public function generatePayrollForBusiness(Business $business, ?Carbon $month = null): int
    {
        $month ??= now();
        $period = $month->format('Y-m');
        $expenseDate = $month->copy()->endOfMonth()->toDateString();
        $category = $this->category($business, 'Payroll', 'Automatically generated monthly employee salary expenses.');
        $created = 0;

        User::query()
            ->where('business_id', $business->id)
            ->where('role', Role::Cashier)
            ->where('status', RecordStatus::Active)
            ->whereNotNull('salary')
            ->where('salary', '>', 0)
            ->orderBy('id')
            ->each(function (User $employee) use ($business, $category, $period, $expenseDate, &$created): void {
                $expense = Expense::firstOrCreate(
                    [
                        'business_id' => $business->id,
                        'source' => ExpenseSource::Payroll,
                        'source_reference_type' => User::class,
                        'source_reference_id' => $employee->id,
                        'source_period' => $period,
                    ],
                    [
                        'expense_category_id' => $category->id,
                        'user_id' => $employee->id,
                        'title' => 'Payroll: '.$employee->name.' ('.$period.')',
                        'amount' => $employee->salary,
                        'expense_date' => $expenseDate,
                        'status' => ExpenseStatus::Pending,
                        'vendor' => $employee->name,
                        'notes' => 'Auto-generated monthly payroll expense.',
                    ],
                );

                if ($expense->wasRecentlyCreated) {
                    $created++;
                }
            });

        return $created;
    }

    private function category(Business $business, string $name, string $description): ExpenseCategory
    {
        return ExpenseCategory::firstOrCreate(
            ['business_id' => $business->id, 'name' => $name],
            ['description' => $description],
        );
    }
}
