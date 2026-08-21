<?php

namespace App\Services;

use App\Enums\NotificationType;
use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
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
            ->when($filters['category'] ?? null, fn (Builder $query, string $category) => $query->where('category', $category))
            ->when($filters['priority'] ?? null, fn (Builder $query, string $priority) => $query->where('priority', $priority))
            ->when(($filters['read'] ?? null) !== null, fn (Builder $query) => $query->where('is_read', (bool) $filters['read']))
            ->whereNull('dismissed_at')
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function unreadCountForUser(?User $user): int
    {
        return $user ? $this->queryForUser($user)->whereNull('dismissed_at')->where('is_read', false)->count() : 0;
    }

    public function recentForUser(?User $user, int $limit = 5): Collection
    {
        return $user
            ? $this->queryForUser($user)->whereNull('dismissed_at')->latest()->take($limit)->get(['id', 'title', 'message', 'type', 'category', 'priority', 'action_url', 'is_read', 'created_at'])
            : collect();
    }

    public function create(
        ?Business $business,
        ?User $user,
        NotificationType|string $type,
        string $title,
        string $message,
        array $metadata = [],
    ): Notification
    {
        $payload = [
            'business_id' => $business?->id,
            'user_id' => $user?->id,
            'related_user_id' => $metadata['related_user_id'] ?? null,
            'type' => $type instanceof NotificationType ? $type->value : $type,
            'title' => $title,
            'message' => $message,
            'category' => $this->enumValue($metadata['category'] ?? null),
            'priority' => $this->enumValue($metadata['priority'] ?? null),
            'action_url' => $metadata['action_url'] ?? null,
            'dedupe_key' => $metadata['dedupe_key'] ?? null,
            'is_read' => false,
        ];

        if ($payload['dedupe_key'] && $payload['user_id']) {
            return Notification::query()->firstOrCreate([
                'user_id' => $payload['user_id'],
                'dedupe_key' => $payload['dedupe_key'],
            ], $payload);
        }

        return Notification::create($payload);
    }

    public function markRead(Notification $notification): Notification
    {
        $notification->forceFill(['is_read' => true])->save();

        return $notification->refresh();
    }

    public function markAllReadForUser(User $user): int
    {
        return $this->queryForUser($user)
            ->whereNull('dismissed_at')
            ->where('is_read', false)
            ->update(['is_read' => true, 'updated_at' => now()]);
    }

    public function dismiss(Notification $notification): Notification
    {
        $notification->forceFill([
            'is_read' => true,
            'dismissed_at' => now(),
        ])->save();

        return $notification->refresh();
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

    private function enumValue(mixed $value): ?string
    {
        if ($value instanceof NotificationCategory || $value instanceof NotificationPriority) {
            return $value->value;
        }

        return is_string($value) ? $value : null;
    }
}
