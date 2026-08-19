<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Customer;
use App\Models\Sale;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CustomerService
{
    public function __construct(private readonly CreditScoringService $creditScoringService) {}

    public function paginateForBusiness(Business $business, ?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        $paginator = Customer::query()
            ->withCount('sales')
            ->withSum('sales as sales_total', 'grand_total')
            ->withMax('sales as last_purchase_at', 'sold_at')
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

        $paginator->getCollection()->transform(function (Customer $customer): Customer {
            $customer->setAttribute('purchase_sparkline', $this->purchaseSparkline($customer));

            return $customer;
        });

        return $paginator;
    }

    /**
     * @return list<array{label: string, value: float}>
     */
    private function purchaseSparkline(Customer $customer): array
    {
        $start = CarbonImmutable::today()->subDays(6);
        $rows = Sale::query()
            ->selectRaw('DATE(sold_at) as day, SUM(grand_total) as total')
            ->where('customer_id', $customer->id)
            ->whereDate('sold_at', '>=', $start)
            ->groupBy('day')
            ->pluck('total', 'day');

        return collect(range(0, 6))
            ->map(fn (int $offset): array => [
                'label' => $start->addDays($offset)->format('M j'),
                'value' => round((float) ($rows[$start->addDays($offset)->toDateString()] ?? 0), 2),
            ])
            ->values()
            ->all();
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
