<?php

namespace App\Services;

use App\Events\ExpenseRecorded;
use App\Models\Business;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ExpenseService
{
    public function __construct(private readonly AuditLogService $auditLogService) {}

    public function paginateForBusiness(Business $business, array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return Expense::query()
            ->with(['category', 'user'])
            ->where('business_id', $business->id)
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(fn ($searchQuery) => $searchQuery
                ->where('title', 'like', '%'.$search.'%')
                ->orWhere('vendor', 'like', '%'.$search.'%')
                ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->where('name', 'like', '%'.$search.'%'))))
            ->when($filters['category_id'] ?? null, fn ($query, $categoryId) => $query->where('expense_category_id', $categoryId))
            ->when($filters['date_from'] ?? null, fn ($query, $date) => $query->whereDate('expense_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, $date) => $query->whereDate('expense_date', '<=', $date))
            ->latest('expense_date')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function totalForBusiness(Business $business, array $filters = []): float
    {
        return (float) Expense::query()
            ->where('business_id', $business->id)
            ->when($filters['category_id'] ?? null, fn ($query, $categoryId) => $query->where('expense_category_id', $categoryId))
            ->when($filters['date_from'] ?? null, fn ($query, $date) => $query->whereDate('expense_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, $date) => $query->whereDate('expense_date', '<=', $date))
            ->sum('amount');
    }

    public function categoriesForBusiness(Business $business)
    {
        return ExpenseCategory::query()
            ->where('business_id', $business->id)
            ->withCount('expenses')
            ->orderBy('name')
            ->get();
    }

    public function createCategory(Business $business, array $data): ExpenseCategory
    {
        return ExpenseCategory::create([...$data, 'business_id' => $business->id]);
    }

    public function updateCategory(ExpenseCategory $category, array $data): ExpenseCategory
    {
        $category->update($data);

        return $category->refresh();
    }

    public function deleteCategory(ExpenseCategory $category): void
    {
        if ($category->expenses()->exists()) {
            throw ValidationException::withMessages([
                'category' => 'This expense category has expenses assigned and cannot be deleted.',
            ]);
        }

        $category->delete();
    }

    public function create(Business $business, User $user, array $data): Expense
    {
        $receiptPath = $this->storeReceipt($data['receipt'] ?? null);
        unset($data['receipt']);

        $expense = Expense::create([
            ...$data,
            'business_id' => $business->id,
            'user_id' => $user->id,
            'receipt_path' => $receiptPath,
        ])->load(['category', 'user']);

        $this->auditLogService->record('expense_recorded', 'expenses', $expense->id, null, $expense->only(['title', 'amount', 'status', 'expense_date']), $user);
        ExpenseRecorded::dispatch($expense);

        return $expense;
    }

    public function update(Expense $expense, array $data): Expense
    {
        $oldValues = $expense->only(['title', 'amount', 'status', 'expense_date', 'vendor', 'notes']);

        if (isset($data['receipt'])) {
            $data['receipt_path'] = $this->storeReceipt($data['receipt']);
            unset($data['receipt']);
        }

        $expense->update($data);
        $expense = $expense->refresh()->load(['category', 'user']);

        $this->auditLogService->record('expense_updated', 'expenses', $expense->id, $oldValues, $expense->only(['title', 'amount', 'status', 'expense_date', 'vendor', 'notes']), auth()->user());

        return $expense;
    }

    public function delete(Expense $expense): void
    {
        $this->auditLogService->record('expense_deleted', 'expenses', $expense->id, $expense->only(['title', 'amount', 'status']), null, auth()->user());
        $expense->delete();
    }

    private function storeReceipt(mixed $receipt): ?string
    {
        if (! $receipt instanceof UploadedFile) {
            return null;
        }

        return $receipt->store('receipts/expenses', 'public');
    }
}
