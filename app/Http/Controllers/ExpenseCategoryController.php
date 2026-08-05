<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExpenseCategoryRequest;
use App\Models\ExpenseCategory;
use App\Services\ExpenseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseCategoryController extends Controller
{
    public function __construct(private readonly ExpenseService $expenseService) {}

    public function store(StoreExpenseCategoryRequest $request): RedirectResponse
    {
        $business = $request->user()->ownedBusiness ?? $request->user()->business;
        abort_unless($business, 403);

        $category = $this->expenseService->createCategory($business, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => $category->name.' expense category created.']);

        return back();
    }

    public function update(StoreExpenseCategoryRequest $request, ExpenseCategory $expenseCategory): RedirectResponse
    {
        $businessId = $request->user()->ownedBusiness?->id ?? $request->user()->business_id;
        abort_unless($expenseCategory->business_id === $businessId, 403);

        $category = $this->expenseService->updateCategory($expenseCategory, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => $category->name.' expense category updated.']);

        return back();
    }

    public function destroy(Request $request, ExpenseCategory $expenseCategory): RedirectResponse
    {
        $businessId = $request->user()->ownedBusiness?->id ?? $request->user()->business_id;
        abort_unless($expenseCategory->business_id === $businessId, 403);

        $this->expenseService->deleteCategory($expenseCategory);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Expense category deleted.']);

        return back();
    }
}
