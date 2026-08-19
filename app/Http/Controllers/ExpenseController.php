<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Models\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function __construct(private readonly ExpenseService $expenseService) {}

    public function store(StoreExpenseRequest $request): RedirectResponse
    {
        $this->authorize('create', Expense::class);
        $business = $request->user()->ownedBusiness ?? $request->user()->business;
        abort_unless($business, 403);

        $expense = $this->expenseService->create($business, $request->user(), $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => $expense->title.' expense recorded.']);

        return back();
    }

    public function update(UpdateExpenseRequest $request, Expense $expense): RedirectResponse
    {
        $this->authorize('update', $expense);

        $expense = $this->expenseService->update($expense, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => $expense->title.' expense updated.']);

        return back();
    }

    public function destroy(Request $request, Expense $expense): RedirectResponse
    {
        $this->authorize('delete', $expense);

        $this->expenseService->delete($expense);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Expense deleted.']);

        return back();
    }
}
