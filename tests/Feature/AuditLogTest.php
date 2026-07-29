<?php

use App\Enums\ExpenseStatus;
use App\Enums\PaymentStatus;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\Business;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Support\Facades\Hash;

function auditOwnerWithBusiness(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

test('guests are redirected from audit logs', function () {
    $this->get(route('admin.audit-logs.index'))->assertRedirect(route('login'));
});

test('owner can view only own business audit logs', function () {
    [$owner, $business] = auditOwnerWithBusiness();
    [, $otherBusiness] = auditOwnerWithBusiness();
    AuditLog::factory()->create(['business_id' => $business->id, 'action' => 'product.created']);
    AuditLog::factory()->create(['business_id' => $otherBusiness->id, 'action' => 'payment.created']);

    $this->actingAs($owner)
        ->get(route('admin.audit-logs.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/audit-logs/index')
            ->where('auditLogs.total', 1)
            ->where('auditLogs.data.0.action', 'product.created'));
});

test('super admin can view all audit logs', function () {
    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin]);
    AuditLog::factory()->count(2)->create();

    $this->actingAs($superAdmin)
        ->get(route('admin.audit-logs.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('auditLogs.total', 2));
});

test('cashier cannot view audit logs', function () {
    $cashier = User::factory()->create(['role' => Role::Cashier]);

    $this->actingAs($cashier)
        ->get(route('admin.audit-logs.index'))
        ->assertForbidden();
});

test('audit log service creates a scoped log with request metadata', function () {
    [$owner, $business] = auditOwnerWithBusiness();
    $product = Product::factory()->create(['business_id' => $business->id]);

    $log = app(AuditLogService::class)->log(
        action: 'product.checked',
        auditable: $product,
        business: $business,
        user: $owner,
        oldValues: ['name' => 'Old name'],
        newValues: ['name' => 'New name'],
    );

    expect($log)->not->toBeNull()
        ->and($log->business_id)->toBe($business->id)
        ->and($log->user_id)->toBe($owner->id)
        ->and($log->table_name)->toBe('products')
        ->and($log->record_id)->toBe($product->id)
        ->and($log->old_values['name'])->toBe('Old name')
        ->and($log->new_values['name'])->toBe('New name');
});

test('login and logout are audited', function () {
    $user = User::factory()->create([
        'role' => Role::Owner,
        'password' => Hash::make('password'),
    ]);

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect();

    $this->post('/logout')->assertRedirect('/');

    $this->assertDatabaseHas('audit_logs', ['user_id' => $user->id, 'action' => 'auth.login']);
    $this->assertDatabaseHas('audit_logs', ['user_id' => $user->id, 'action' => 'auth.logout']);
});

test('product observer logs creation update and deactivation', function () {
    [$owner, $business] = auditOwnerWithBusiness();

    $this->actingAs($owner);
    $product = Product::factory()->create(['business_id' => $business->id, 'name' => 'Original Item']);
    $product->update(['name' => 'Updated Item', 'status' => RecordStatus::Inactive]);

    $this->assertDatabaseHas('audit_logs', [
        'business_id' => $business->id,
        'user_id' => $owner->id,
        'action' => 'product.created',
        'table_name' => 'products',
        'record_id' => $product->id,
    ]);
    $this->assertDatabaseHas('audit_logs', [
        'business_id' => $business->id,
        'user_id' => $owner->id,
        'action' => 'product.updated',
        'table_name' => 'products',
        'record_id' => $product->id,
    ]);

    $updateLog = AuditLog::query()->where('action', 'product.updated')->where('record_id', $product->id)->firstOrFail();
    expect($updateLog->old_values['name'])->toBe('Original Item')
        ->and($updateLog->new_values['name'])->toBe('Updated Item');
});

test('sale payment and expense observers log activity', function () {
    [$owner, $business] = auditOwnerWithBusiness();
    $this->actingAs($owner);

    $sale = Sale::factory()->create(['business_id' => $business->id, 'user_id' => $owner->id]);
    $payment = Payment::factory()->create([
        'business_id' => $business->id,
        'sale_id' => $sale->id,
        'user_id' => $owner->id,
        'status' => PaymentStatus::Pending,
    ]);
    $payment->update(['status' => PaymentStatus::Completed]);
    $category = ExpenseCategory::factory()->create(['business_id' => $business->id]);
    $expense = Expense::factory()->create([
        'business_id' => $business->id,
        'expense_category_id' => $category->id,
        'user_id' => $owner->id,
        'amount' => 100,
    ]);
    $expense->update(['amount' => 175, 'status' => ExpenseStatus::Approved]);

    $this->assertDatabaseHas('audit_logs', ['business_id' => $business->id, 'action' => 'sale.created', 'record_id' => $sale->id]);
    $this->assertDatabaseHas('audit_logs', ['business_id' => $business->id, 'action' => 'payment.created', 'record_id' => $payment->id]);
    $this->assertDatabaseHas('audit_logs', ['business_id' => $business->id, 'action' => 'payment.updated', 'record_id' => $payment->id]);
    $this->assertDatabaseHas('audit_logs', ['business_id' => $business->id, 'action' => 'expense.created', 'record_id' => $expense->id]);
    $this->assertDatabaseHas('audit_logs', ['business_id' => $business->id, 'action' => 'expense.updated', 'record_id' => $expense->id]);
});

test('audit logs can be filtered by action and date', function () {
    [$owner, $business] = auditOwnerWithBusiness();
    AuditLog::factory()->create(['business_id' => $business->id, 'action' => 'product.created', 'created_at' => now()]);
    AuditLog::factory()->create(['business_id' => $business->id, 'action' => 'payment.created', 'created_at' => now()->subDays(5)]);

    $this->actingAs($owner)
        ->get(route('admin.audit-logs.index', [
            'action' => 'product.created',
            'date_from' => now()->subDay()->toDateString(),
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('auditLogs.total', 1)
            ->where('auditLogs.data.0.action', 'product.created'));
});
