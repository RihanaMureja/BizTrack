<?php

namespace App\Http\Controllers;

use App\Enums\ExpenseStatus;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Models\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function __construct(private readonly ExpenseService $expenseService) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Expense::class);

        $business = $request->user()->ownedBusiness ?? $request->user()->business;
        $filters = [
            'search' => $request->string('search')->toString() ?: null,
            'category_id' => $request->integer('category_id') ?: null,
            'date_from' => $request->string('date_from')->toString() ?: null,
            'date_to' => $request->string('date_to')->toString() ?: null,
        ];

        return Inertia::render('expenses/index', [
            'expenses' => $business ? $this->expenseService->paginateForBusiness($business, $filters) : null,
            'categories' => $business ? $this->expenseService->categoriesForBusiness($business) : [],
            'statuses' => collect(ExpenseStatus::cases())->map(fn (ExpenseStatus $status): array => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->values(),
            'total' => $business ? number_format($this->expenseService->totalForBusiness($business, $filters), 2) : '0.00',
            'filters' => $filters,
        ]);
    }

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
