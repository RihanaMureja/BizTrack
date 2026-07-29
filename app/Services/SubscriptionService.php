<?php

namespace App\Services;

use App\Enums\RecordStatus;
use App\Models\Subscription;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class SubscriptionService
{
    public function paginateForAdmin(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        return Subscription::query()
            ->withCount('businesses')
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(fn ($searchQuery) => $searchQuery
                ->where('name', 'like', '%'.$search.'%')
                ->orWhere('description', 'like', '%'.$search.'%')))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->orderBy('price')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @return Collection<int, Subscription>
     */
    public function activePlans(): Collection
    {
        return Subscription::query()
            ->where('status', RecordStatus::Active)
            ->orderBy('price')
            ->get();
    }

    public function defaultPlan(): ?Subscription
    {
        return $this->activePlans()->first();
    }

    public function create(array $data): Subscription
    {
        return Subscription::create($data);
    }

    public function update(Subscription $subscription, array $data): Subscription
    {
        $subscription->update($data);

        return $subscription->refresh();
    }

    public function activate(Subscription $subscription): Subscription
    {
        $subscription->forceFill(['status' => RecordStatus::Active])->save();

        return $subscription->refresh();
    }

    public function deactivate(Subscription $subscription): Subscription
    {
        $subscription->forceFill(['status' => RecordStatus::Inactive])->save();

        return $subscription->refresh();
    }
}
