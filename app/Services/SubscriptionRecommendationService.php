<?php

namespace App\Services;

use App\Enums\BusinessSubscriptionStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Subscription;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Carbon;

class SubscriptionRecommendationService
{
    public const WARNING_DAYS = 10;

    public function __construct(
        private readonly SubscriptionService $subscriptionService,
    ) {}

    /**
     * @return Collection<int, Subscription>
     */
    public function plans(): EloquentCollection
    {
        return $this->subscriptionService->activePlans();
    }

    public function daysRemaining(?Business $business): ?int
    {
        $endsAt = $business?->subscription_ends_at;

        if (! $endsAt) {
            return null;
        }

        $seconds = max(0, $endsAt->getTimestamp() - Carbon::now()->getTimestamp());

        return (int) floor($seconds / 86400);
    }

    public function effectiveStatus(Business $business): BusinessSubscriptionStatus
    {
        $status = $business->subscription_status ?? BusinessSubscriptionStatus::None;

        if ($status === BusinessSubscriptionStatus::Active
            && $business->subscription_ends_at
            && $business->subscription_ends_at->isPast()) {
            $business->forceFill(['subscription_status' => BusinessSubscriptionStatus::Expired])->save();

            return BusinessSubscriptionStatus::Expired;
        }

        return $status;
    }

    public function isExpiring(?Business $business): bool
    {
        if (! $business || $this->effectiveStatus($business) !== BusinessSubscriptionStatus::Active) {
            return false;
        }

        $days = $this->daysRemaining($business);

        return $days !== null && $days <= self::WARNING_DAYS;
    }

    public function cashiersCount(Business $business): int
    {
        return $business->users()
            ->where('role', Role::Cashier)
            ->count();
    }

    public function limitReached(Business $business): bool
    {
        $limit = (int) ($business->subscription?->max_cashiers ?? 0);

        return $limit > 0 && $this->cashiersCount($business) >= $limit;
    }

    public function recommendedPlan(Business $business): ?Subscription
    {
        $plans = $this->plans();
        $current = $business->subscription;

        if (! $current) {
            return $plans->first();
        }

        $currentPrice = (float) $current->price;
        $count = $this->cashiersCount($business);

        $higherPlans = $plans->filter(
            fn (Subscription $plan): bool => (float) $plan->price > $currentPrice,
        );

        $fitting = $higherPlans->first(
            fn (Subscription $plan): bool => (int) $plan->max_cashiers > $count,
        );

        if ($fitting) {
            return $fitting;
        }

        if ($higherPlans->isNotEmpty()) {
            return $higherPlans->first();
        }

        return $current;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function recommendationFor(?Business $business): ?array
    {
        if (! $business) {
            return null;
        }

        $status = $this->effectiveStatus($business);
        $daysRemaining = $this->daysRemaining($business);
        $isExpiring = $status === BusinessSubscriptionStatus::Active
            && $daysRemaining !== null
            && $daysRemaining <= self::WARNING_DAYS;
        $limitReached = $this->limitReached($business);
        $current = $business->subscription;
        $recommended = $this->recommendedPlan($business);

        $reason = null;
        if ($isExpiring) {
            $reason = 'expiring';
        } elseif ($limitReached) {
            $reason = 'limit';
        }

        return [
            'status' => $status->value,
            'daysRemaining' => $daysRemaining,
            'warningDays' => self::WARNING_DAYS,
            'isExpiring' => $isExpiring,
            'limitReached' => $limitReached,
            'reason' => $reason,
            'cashiersCount' => $this->cashiersCount($business),
            'maxCashiers' => $current?->max_cashiers,
            'currentPlan' => $current ? $this->planPayload($current) : null,
            'recommendedPlan' => $recommended ? $this->planPayload($recommended) : null,
            'isRenewal' => $recommended !== null && $current !== null && $recommended->id === $current->id,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function planPayload(Subscription $plan): array
    {
        return [
            'id' => $plan->id,
            'name' => $plan->name,
            'price' => (string) $plan->price,
            'duration_months' => $plan->duration_months,
            'duration_days' => $plan->duration_days,
            'max_cashiers' => $plan->max_cashiers,
            'description' => $plan->description,
            'features' => $plan->features,
        ];
    }
}
