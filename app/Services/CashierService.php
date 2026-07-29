<?php

namespace App\Services;

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Events\CashierCreated;
use App\Models\Business;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CashierService
{
    public function paginateForBusiness(Business $business, ?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        return User::query()
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
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(Business $business, array $data): User
    {
        $this->ensureCashierLimit($business);

        $cashier = User::create([
            'business_id' => $business->id,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'] ?? null,
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'role' => Role::Cashier,
            'status' => RecordStatus::from($data['status']),
            'email_verified_at' => now(),
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
            'last_name' => $data['last_name'] ?? null,
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'status' => RecordStatus::from($data['status']),
        ];

        if (! empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
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
        $temporaryPassword = 'cashier-'.Str::lower(Str::random(8));

        $cashier->update(['password' => Hash::make($temporaryPassword)]);

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
