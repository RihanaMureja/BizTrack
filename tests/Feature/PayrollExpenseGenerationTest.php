<?php

use App\Enums\ExpenseSource;
use App\Enums\ExpenseStatus;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Expense;
use App\Models\User;

test('monthly payroll command creates one expense per salaried employee', function () {
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $employee = User::factory()->create([
        'business_id' => $business->id,
        'role' => Role::Cashier,
        'status' => RecordStatus::Active,
        'salary' => 4500,
    ]);
    User::factory()->create([
        'business_id' => $business->id,
        'role' => Role::Cashier,
        'status' => RecordStatus::Active,
        'salary' => null,
    ]);

    $this->artisan('expenses:generate-payroll', ['--month' => '2026-08'])
        ->expectsOutput('1 payroll expense(s) generated for August 2026.')
        ->assertSuccessful();

    $expense = Expense::query()->where('source', ExpenseSource::Payroll)->firstOrFail();

    expect($expense->business_id)->toBe($business->id)
        ->and($expense->source_reference_type)->toBe($employee::class)
        ->and($expense->source_reference_id)->toBe($employee->id)
        ->and($expense->source_period)->toBe('2026-08')
        ->and((float) $expense->amount)->toBe(4500.0)
        ->and($expense->status)->toBe(ExpenseStatus::Pending);
});

test('monthly payroll command is idempotent for the same period', function () {
    $business = Business::factory()->create();
    User::factory()->create([
        'business_id' => $business->id,
        'role' => Role::Cashier,
        'status' => RecordStatus::Active,
        'salary' => 3000,
    ]);

    $this->artisan('expenses:generate-payroll', ['--month' => '2026-08'])->assertSuccessful();
    $this->artisan('expenses:generate-payroll', ['--month' => '2026-08'])
        ->expectsOutput('0 payroll expense(s) generated for August 2026.')
        ->assertSuccessful();

    expect(Expense::query()->where('source', ExpenseSource::Payroll)->count())->toBe(1);
});
