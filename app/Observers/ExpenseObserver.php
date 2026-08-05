<?php

namespace App\Observers;

use App\Models\Expense;
use App\Services\AuditLogService;

class ExpenseObserver
{
    public function creating(Expense $expense): void
    {
        $expense->expense_date ??= today();
    }

    public function created(Expense $expense): void
    {
        app(AuditLogService::class)->log(
            action: 'expense.created',
            auditable: $expense,
            user: $expense->user,
            newValues: $expense->only(['title', 'amount', 'status', 'expense_date', 'vendor']),
        );
    }

    public function updated(Expense $expense): void
    {
        $changes = collect($expense->getChanges())->except(['updated_at'])->keys();

        if ($changes->isEmpty()) {
            return;
        }

        app(AuditLogService::class)->log(
            action: 'expense.updated',
            auditable: $expense,
            user: auth()->user() ?? $expense->user,
            oldValues: $changes->mapWithKeys(fn (string $key): array => [$key => $expense->getOriginal($key)])->all(),
            newValues: $changes->mapWithKeys(fn (string $key): array => [$key => $expense->{$key}])->all(),
        );
    }

    public function deleted(Expense $expense): void
    {
        app(AuditLogService::class)->log(
            action: 'expense.deleted',
            auditable: $expense,
            user: auth()->user() ?? $expense->user,
            oldValues: $expense->only(['title', 'amount', 'status']),
        );
    }
}
