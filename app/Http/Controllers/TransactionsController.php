<?php

namespace App\Http\Controllers;

use App\Enums\ExpenseSource;
use App\Enums\ExpenseStatus;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Payment;
use App\Services\ExpenseService;
use App\Services\PaymentService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionsController extends Controller
{
    public function __construct(
        private readonly ExpenseService $expenseService,
        private readonly PaymentService $paymentService,
    ) {}

    public function index(Request $request): Response
    {
        $business = $request->user()->ownedBusiness ?? $request->user()->business;

        $search = $request->string('search')->toString();
        $activeTab = $request->string('tab')->toString() === 'expenses' ? 'expenses' : 'revenue';

        $filters = [
            'search' => $search ?: null,
            'category_id' => $request->integer('category_id') ?: null,
            'source' => $request->string('source')->toString() ?: null,
            'date_from' => $request->string('date_from')->toString() ?: null,
            'date_to' => $request->string('date_to')->toString() ?: null,
        ];

        return Inertia::render('transactions/index', [
            'activeTab' => $activeTab,
            'expenses' => $business ? $this->expenseService->paginateForBusiness($business, $filters) : null,
            'payments' => $business ? $this->paymentService->paginateForBusiness($business, $search) : null,
            'expenseCategories' => $business ? $this->expenseService->categoriesForBusiness($business) : [],
            'expenseStatuses' => collect(ExpenseStatus::cases())->map(fn (ExpenseStatus $status): array => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->values(),
            'expenseSources' => collect(ExpenseSource::cases())->map(fn (ExpenseSource $source): array => [
                'value' => $source->value,
                'label' => $source->label(),
            ])->values(),
            'total' => $business ? number_format($this->expenseService->totalForBusiness($business, $filters), 2) : '0.00',
            'filters' => $filters,
        ]);
    }
}
