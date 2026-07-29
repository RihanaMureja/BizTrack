<?php

use App\Enums\ExpenseStatus;
use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\Business;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function expenseBusinessContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

test('guests are redirected from expenses', function () {
    $this->get(route('expenses.index'))->assertRedirect(route('login'));
});

test('cashier cannot access expense management', function () {
    [$owner, $business] = expenseBusinessContext();
    $cashier = User::factory()->create(['role' => Role::Cashier, 'business_id' => $business->id]);

    $this->actingAs($cashier)->get(route('expenses.index'))->assertForbidden();
});

test('owner can open expenses page', function () {
    [$owner, $business] = expenseBusinessContext();
    $category = ExpenseCategory::factory()->create(['business_id' => $business->id]);
    Expense::factory()->create(['business_id' => $business->id, 'expense_category_id' => $category->id, 'user_id' => $owner->id, 'amount' => 250]);

    $this->actingAs($owner)
        ->get(route('expenses.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('expenses/index')
            ->where('expenses.total', 1)
            ->has('categories', 1)
            ->where('total', '250.00'));
});

test('owner can create update and delete expense category', function () {
    [$owner] = expenseBusinessContext();

    $this->actingAs($owner)
        ->post(route('expense-categories.store'), ['name' => 'Utilities', 'description' => 'Monthly bills'])
        ->assertRedirect();

    $category = ExpenseCategory::query()->firstOrFail();
    expect($category->name)->toBe('Utilities');

    $this->actingAs($owner)
        ->put(route('expense-categories.update', $category), ['name' => 'Operations', 'description' => 'Ops'])
        ->assertRedirect();

    expect($category->refresh()->name)->toBe('Operations');

    $this->actingAs($owner)->delete(route('expense-categories.destroy', $category))->assertRedirect();
    expect(ExpenseCategory::query()->count())->toBe(0);
});

test('category with expenses cannot be deleted', function () {
    [$owner, $business] = expenseBusinessContext();
    $category = ExpenseCategory::factory()->create(['business_id' => $business->id]);
    Expense::factory()->create(['business_id' => $business->id, 'expense_category_id' => $category->id, 'user_id' => $owner->id]);

    $this->actingAs($owner)
        ->delete(route('expense-categories.destroy', $category))
        ->assertSessionHasErrors('category');
});

test('owner can create update and delete an expense with receipt', function () {
    Storage::fake('public');
    [$owner, $business] = expenseBusinessContext();
    $category = ExpenseCategory::factory()->create(['business_id' => $business->id]);

    $this->actingAs($owner)
        ->post(route('expenses.store'), [
            'expense_category_id' => $category->id,
            'title' => 'Printer paper',
            'amount' => 120,
            'expense_date' => today()->toDateString(),
            'status' => ExpenseStatus::Approved->value,
            'vendor' => 'Office Shop',
            'receipt' => UploadedFile::fake()->image('receipt.jpg'),
        ])
        ->assertRedirect();

    $expense = Expense::query()->firstOrFail();
    expect($expense->title)->toBe('Printer paper')
        ->and($expense->receipt_path)->not->toBeNull();
    Storage::disk('public')->assertExists($expense->receipt_path);

    $this->actingAs($owner)
        ->post(route('expenses.update', $expense).'?_method=PUT', [
            'expense_category_id' => $category->id,
            'title' => 'Printer paper pack',
            'amount' => 150,
            'expense_date' => today()->toDateString(),
            'status' => ExpenseStatus::Paid->value,
        ])
        ->assertRedirect();

    expect($expense->refresh()->title)->toBe('Printer paper pack')
        ->and((float) $expense->amount)->toBe(150.0)
        ->and($expense->status)->toBe(ExpenseStatus::Paid);

    $this->actingAs($owner)->delete(route('expenses.destroy', $expense))->assertRedirect();
    expect(Expense::query()->count())->toBe(0);
});

test('expense validation scopes category to owner business', function () {
    [$owner] = expenseBusinessContext();
    [, $otherBusiness] = expenseBusinessContext();
    $category = ExpenseCategory::factory()->create(['business_id' => $otherBusiness->id]);

    $this->actingAs($owner)
        ->post(route('expenses.store'), [
            'expense_category_id' => $category->id,
            'title' => 'Bad category',
            'amount' => 50,
            'expense_date' => today()->toDateString(),
            'status' => ExpenseStatus::Approved->value,
        ])
        ->assertSessionHasErrors('expense_category_id');
});

test('expense filters by category and date', function () {
    [$owner, $business] = expenseBusinessContext();
    $rent = ExpenseCategory::factory()->create(['business_id' => $business->id, 'name' => 'Rent']);
    $fuel = ExpenseCategory::factory()->create(['business_id' => $business->id, 'name' => 'Fuel']);
    Expense::factory()->create(['business_id' => $business->id, 'expense_category_id' => $rent->id, 'user_id' => $owner->id, 'amount' => 100, 'expense_date' => today()]);
    Expense::factory()->create(['business_id' => $business->id, 'expense_category_id' => $fuel->id, 'user_id' => $owner->id, 'amount' => 70, 'expense_date' => today()->subDays(3)]);

    $this->actingAs($owner)
        ->get(route('expenses.index', ['category_id' => $rent->id, 'date_from' => today()->toDateString()]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('expenses.total', 1)->where('total', '100.00'));
});

test('recording expense writes audit log', function () {
    [$owner, $business] = expenseBusinessContext();
    $category = ExpenseCategory::factory()->create(['business_id' => $business->id]);

    $this->actingAs($owner)
        ->post(route('expenses.store'), [
            'expense_category_id' => $category->id,
            'title' => 'Internet bill',
            'amount' => 300,
            'expense_date' => today()->toDateString(),
            'status' => ExpenseStatus::Approved->value,
        ])
        ->assertRedirect();

    $expense = Expense::query()->firstOrFail();
    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $owner->id,
        'action' => 'expense_recorded',
        'table_name' => 'expenses',
        'record_id' => $expense->id,
    ]);

    $log = AuditLog::query()->where('record_id', $expense->id)->where('action', 'expense_recorded')->firstOrFail();
    expect($log->new_values['title'])->toBe('Internet bill');
});
