<?php

namespace App\Services;

use App\Enums\NotificationType;
use App\Models\Business;
use App\Models\Notification;
use App\Models\Sale;
use App\Models\User;
use App\Notifications\DailySalesNotification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class NotificationService
{
    public function paginateForUser(User $user, array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        return $this->queryForUser($user)
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $searchQuery) => $searchQuery
                ->where('title', 'like', '%'.$search.'%')
                ->orWhere('message', 'like', '%'.$search.'%')))
            ->when($filters['type'] ?? null, fn (Builder $query, string $type) => $query->where('type', $type))
            ->when(($filters['read'] ?? null) !== null, fn (Builder $query) => $query->where('is_read', (bool) $filters['read']))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function unreadCountForUser(?User $user): int
    {
        return $user ? $this->queryForUser($user)->where('is_read', false)->count() : 0;
    }

    public function recentForUser(?User $user, int $limit = 5): Collection
    {
        return $user
            ? $this->queryForUser($user)->latest()->take($limit)->get(['id', 'title', 'message', 'type', 'is_read', 'created_at'])
            : collect();
    }

    public function create(?Business $business, ?User $user, NotificationType|string $type, string $title, string $message): Notification
    {
        return Notification::create([
            'business_id' => $business?->id,
            'user_id' => $user?->id,
            'type' => $type instanceof NotificationType ? $type->value : $type,
            'title' => $title,
            'message' => $message,
            'is_read' => false,
        ]);
    }

    public function markRead(Notification $notification): Notification
    {
        $notification->forceFill(['is_read' => true])->save();

        return $notification->refresh();
    }

    public function markAllReadForUser(User $user): int
    {
        return $this->queryForUser($user)->where('is_read', false)->update(['is_read' => true, 'updated_at' => now()]);
    }

    public function createDailySalesSummary(Business $business): ?Notification
    {
        $owner = $business->owner;

        if (! $owner) {
            return null;
        }

        $salesQuery = Sale::query()
            ->where('business_id', $business->id)
            ->whereDate('sold_at', today());

        $salesCount = (clone $salesQuery)->count();
        $revenue = (float) (clone $salesQuery)->sum('grand_total');

        $notification = $this->create(
            $business,
            $owner,
            NotificationType::DailySales,
            'Daily sales summary',
            $salesCount.' sales completed today with '.number_format($revenue, 2).' ETB revenue.'
        );

        $owner->notify(new DailySalesNotification($salesCount, $revenue));

        return $notification;
    }

    public function queryForUser(User $user): Builder
    {
        $businessId = $user->ownedBusiness?->id ?? $user->business_id;

        return Notification::query()
            ->where(function (Builder $query) use ($user, $businessId): void {
                $query->where('user_id', $user->id);

                if ($businessId) {
                    $query->orWhere('business_id', $businessId);
                }
            });
    }
}
