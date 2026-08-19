<?php

namespace App\Services;

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Events\CashierCreated;
use App\Models\Business;
use App\Models\Sale;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CashierService
{
    public function __construct(
        private readonly PasswordSecurityService $passwordSecurityService,
        private readonly BusinessRoleService $businessRoleService,
    ) {}

    public function paginateForBusiness(Business $business, ?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        $paginator = User::query()
            ->with('businessRole.permissions:id,key,name,group')
            ->withCount(['sales as sales_count_30d' => fn ($query) => $query->whereDate('sold_at', '>=', today()->subDays(29))])
            ->withSum(['sales as sales_total_30d' => fn ($query) => $query->whereDate('sold_at', '>=', today()->subDays(29))], 'grand_total')
            ->where('business_id', $business->id)
            ->where('role', Role::Cashier)
            ->when($search, function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('name', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%')
                        ->orWhere('phone', 'like', '%'.$search.'%');
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $paginator->getCollection()->transform(function (User $cashier): User {
            $cashier->setAttribute('sales_sparkline', $this->salesSparkline($cashier));

            return $cashier;
        });

        return $paginator;
    }

    /**
     * @return list<array{label: string, value: float}>
     */
    private function salesSparkline(User $cashier): array
    {
        $start = CarbonImmutable::today()->subDays(6);
        $rows = Sale::query()
            ->selectRaw('DATE(sold_at) as day, SUM(grand_total) as total')
            ->where('user_id', $cashier->id)
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
    public function create(Business $business, array $data): User
    {
        $this->ensureCashierLimit($business);

        $cashier = User::create([
            'business_id' => $business->id,
            'business_role_id' => $data['business_role_id'] ?? $this->businessRoleService->defaultRoleFor($business)->id,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'] ?? null,
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'salary' => $data['salary'] ?? null,
            'password' => $data['password'],
            'role' => Role::Cashier,
            'status' => RecordStatus::from($data['status']),
            'email_verified_at' => now(),
            'must_reset_password' => true,
            'temporary_password_expires_at' => now()->addDays(7),
        ]);

        CashierCreated::dispatch($cashier);

        return $cashier;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(User $cashier, array $data): User
    {
        $payload = [
            'first_name' => $data['first_name'],
            'business_role_id' => $data['business_role_id'] ?? $cashier->business_role_id,
            'last_name' => $data['last_name'] ?? null,
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'salary' => $data['salary'] ?? null,
            'status' => RecordStatus::from($data['status']),
        ];

        if (! empty($data['password'])) {
            $payload['password'] = $data['password'];
            $payload['must_reset_password'] = true;
            $payload['password_changed_at'] = null;
            $payload['temporary_password_expires_at'] = now()->addDays(7);
        }

        $cashier->update($payload);

        return $cashier->refresh();
    }

    public function deactivate(User $cashier): User
    {
        $cashier->update(['status' => RecordStatus::Inactive]);

        return $cashier->refresh();
    }

    public function resetPassword(User $cashier): string
    {
        $temporaryPassword = 'Temp#'.Str::random(8).'9a';

        $this->passwordSecurityService->setTemporaryPassword($cashier, $temporaryPassword);

        return $temporaryPassword;
    }

    public function delete(User $cashier): void
    {
        $cashier->delete();
    }

    protected function ensureCashierLimit(Business $business): void
    {
        $limit = (int) ($business->subscription?->max_cashiers ?? 0);
        $count = User::query()
            ->where('business_id', $business->id)
            ->where('role', Role::Cashier)
            ->count();

        if ($limit > 0 && $count >= $limit) {
            throw ValidationException::withMessages([
                'cashiers' => 'Your current subscription allows up to '.$limit.' cashier account(s).',
            ]);
        }
    }
}
