<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Customer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CustomerService
{
    public function __construct(private readonly CreditScoringService $creditScoringService) {}

    public function paginateForBusiness(Business $business, ?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        return Customer::query()
            ->where('business_id', $business->id)
            ->when($search, function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('display_name', 'like', '%'.$search.'%')
                        ->orWhere('full_name', 'like', '%'.$search.'%')
                        ->orWhere('contact_person', 'like', '%'.$search.'%')
                        ->orWhere('phone', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%');
                });
            })
            ->orderBy('display_name')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(Business $business, array $data): Customer
    {
        unset($data['current_balance'], $data['credit_limit']);
        $data['full_name'] = $data['display_name'];

        $customer = Customer::create([
            ...$data,
            'business_id' => $business->id,
            'credit_limit' => 0,
            'current_balance' => 0,
        ]);

        $this->creditScoringService->syncProfile($customer);

        return $customer;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Customer $customer, array $data): Customer
    {
        unset($data['current_balance'], $data['credit_limit']);
        $data['full_name'] = $data['display_name'];

        $customer->update($data);
        $this->creditScoringService->syncProfile($customer);

        return $customer->refresh();
    }

    public function delete(Customer $customer): void
    {
        $customer->delete();
    }
}
