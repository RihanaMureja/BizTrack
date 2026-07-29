<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly CustomerService $customerService) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Customer::class);

        $business = $request->user()->ownedBusiness ?? $request->user()->business;
        $search = $request->string('search')->toString() ?: null;

        return Inertia::render('customers/index', [
            'customers' => $business
                ? $this->customerService->paginateForBusiness($business, $search)
                : null,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function show(Customer $customer): Response
    {
        $this->authorize('view', $customer);

        return Inertia::render('customers/show', [
            'customer' => $customer,
            'purchaseHistory' => [],
        ]);
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $business = $request->user()->ownedBusiness ?? $request->user()->business;

        if (! $business) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Create or assign a business before adding customers.',
            ]);

            return to_route('business.profile');
        }

        $this->authorize('create', Customer::class);

        $customer = $this->customerService->create($business, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => $customer->full_name.' customer created.']);

        return back();
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $this->authorize('update', $customer);

        $customer = $this->customerService->update($customer, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => $customer->full_name.' customer updated.']);

        return back();
    }

    public function destroy(Request $request, Customer $customer): RedirectResponse
    {
        $this->authorize('delete', $customer);

        $this->customerService->delete($customer);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Customer deleted.']);

        return back();
    }
}
