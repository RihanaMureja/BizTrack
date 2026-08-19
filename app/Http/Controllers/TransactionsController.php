<?php

namespace App\Http\Controllers;

use App\Enums\BusinessPermissionKey;
use App\Enums\ExpenseSource;
use App\Enums\ExpenseStatus;
use App\Services\ExpenseService;
use App\Services\PaymentService;
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
        $user = $request->user();
        $business = $user->ownedBusiness ?? $user->business;
        $canManagePayments = $user->hasBusinessPermission(BusinessPermissionKey::ManagePayments);
        $canManageExpenses = $user->hasBusinessPermission(BusinessPermissionKey::ManageExpenses);

        $search = $request->string('search')->toString();
        $requestedTab = $request->string('tab')->toString() === 'expenses' ? 'expenses' : 'revenue';
        $activeTab = match (true) {
            $requestedTab === 'expenses' && $canManageExpenses => 'expenses',
            $canManagePayments => 'revenue',
            default => 'expenses',
        };
        $dateFrom = $request->string('date_from')->toString() ?: null;
        $dateTo = $request->string('date_to')->toString() ?: null;

        $filters = [
            'search' => $search ?: null,
            'category_id' => $request->integer('category_id') ?: null,
            'source' => $request->string('source')->toString() ?: null,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
        ];

        return Inertia::render('transactions/index', [
            'activeTab' => $activeTab,
            'canManageExpenses' => $canManageExpenses,
            'canManagePayments' => $canManagePayments,
            'expenses' => $business && $canManageExpenses ? $this->expenseService->paginateForBusiness($business, $filters) : null,
            'payments' => $business && $canManagePayments ? $this->paymentService->paginateCompletedForBusiness($business, $search ?: null, $dateFrom, $dateTo) : null,
            'expenseCategories' => $business && $canManageExpenses ? $this->expenseService->categoriesForBusiness($business) : [],
            'expenseStatuses' => collect(ExpenseStatus::cases())->map(fn(ExpenseStatus $status): array => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->values(),
            'expenseSources' => collect(ExpenseSource::cases())->map(fn(ExpenseSource $source): array => [
                'value' => $source->value,
                'label' => $source->label(),
            ])->values(),
            'total' => $business && $canManageExpenses ? number_format($this->expenseService->totalForBusiness($business, $filters), 2) : '0.00',
            'revenueTotal' => $business && $canManagePayments ? $this->paymentService->revenueTotalForBusiness($business, $search ?: null, $dateFrom, $dateTo) : '0.00',
            'filters' => $filters,
        ]);
    }
}
