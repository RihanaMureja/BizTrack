<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCashierRequest;
use App\Http\Requests\UpdateCashierRequest;
use App\Models\User;
use App\Services\CashierService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rules\Password;

class CashierController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly CashierService $cashierService) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $business = $request->user()->ownedBusiness ?? $request->user()->business;
        $search = $request->string('search')->toString() ?: null;

        return Inertia::render('cashiers/index', [
            'cashiers' => $business
                ? $this->cashierService->paginateForBusiness($business, $search)
                : null,
            'businessRoles' => $business
                ? $business->roles()->with('permissions:id,key,name,group')->orderBy('name')->get(['id', 'business_id', 'name', 'description', 'is_default'])
                : [],
            'filters' => ['search' => $search],
            'cashierLimit' => $business?->subscription?->max_cashiers ?? 0,
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]);
    }

    public function store(StoreCashierRequest $request): RedirectResponse
    {
        $business = $request->user()->ownedBusiness ?? $request->user()->business;

        if (! $business) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Create your business profile before adding employees.']);

            return to_route('business.profile');
        }

        $this->authorize('create', User::class);

        $cashier = $this->cashierService->create($business, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => $cashier->name.' employee created.']);

        return back();
    }

    public function update(UpdateCashierRequest $request, User $cashier): RedirectResponse
    {
        $this->authorize('update', $cashier);

        $cashier = $this->cashierService->update($cashier, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => $cashier->name.' employee updated.']);

        return back();
    }

    public function deactivate(Request $request, User $cashier): RedirectResponse
    {
        $this->authorize('update', $cashier);

        $this->cashierService->deactivate($cashier);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Employee deactivated.']);

        return back();
    }

    public function resetPassword(Request $request, User $cashier): RedirectResponse
    {
        $this->authorize('update', $cashier);

        $temporaryPassword = $this->cashierService->resetPassword($cashier);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Temporary password: '.$temporaryPassword,
        ]);

        return back();
    }

    public function destroy(Request $request, User $cashier): RedirectResponse
    {
        $this->authorize('delete', $cashier);

        $this->cashierService->delete($cashier);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Employee deleted.']);

        return back();
    }
}
