<?php

namespace App\Http\Controllers;

use App\Enums\BusinessAccessMode;
use App\Enums\RecordStatus;
use App\Helpers\CurrencyHelper;
use App\Helpers\DateHelper;
use App\Models\Business;
use App\Models\Payment;
use App\Models\Subscription;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminReportController extends Controller
{
    public function revenue(Request $request): Response
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $subscriptions = Subscription::query()
            ->where('status', RecordStatus::Active->value)
            ->withCount('businesses')
            ->orderByDesc('price')
            ->get();

        $assignedBusinesses = $subscriptions->sum('businesses_count');
        $unassignedBusinesses = Business::whereNull('subscription_id')->count();
        $estimatedMonthlyRevenue = $subscriptions->sum(fn (Subscription $subscription): float => (float) $subscription->price * (int) $subscription->businesses_count);

        $rows = $subscriptions
            ->map(fn (Subscription $subscription): array => [
                'name' => $subscription->name,
                'price' => (float) $subscription->price,
                'duration_months' => $subscription->duration_months,
                'max_cashiers' => $subscription->max_cashiers,
                'businesses_count' => $subscription->businesses_count,
                'estimated_mrr' => (float) $subscription->price * (int) $subscription->businesses_count,
                'status' => $subscription->status->value,
            ])
            ->values();

        return Inertia::render('admin/reports/revenue', [
            'report' => [
                'title' => 'Platform Revenue',
                'summary' => [
                    ['label' => 'Active Plans', 'value' => (string) $subscriptions->count()],
                    ['label' => 'Assigned Businesses', 'value' => (string) $assignedBusinesses],
                    ['label' => 'Estimated MRR', 'value' => CurrencyHelper::money($estimatedMonthlyRevenue)],
                    ['label' => 'Unassigned Businesses', 'value' => (string) $unassignedBusinesses],
                ],
                'chart' => $subscriptions
                    ->take(8)
                    ->map(fn (Subscription $subscription): array => [
                        'label' => str($subscription->name)->limit(14)->toString(),
                        'value' => (float) $subscription->price * (int) $subscription->businesses_count,
                    ])
                    ->values(),
                'rows' => $rows,
                'topPlans' => $rows->sortByDesc('estimated_mrr')->take(5)->values(),
                'gatewayMix' => $this->paymentGatewayMix(),
                'revenueHealth' => [
                    ['label' => 'Assigned', 'value' => (float) $assignedBusinesses],
                    ['label' => 'Unassigned', 'value' => (float) $unassignedBusinesses],
                ],
            ],
        ]);
    }

    public function businessGrowth(Request $request): Response
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        [$from, $to] = $this->range($request);

        $businesses = Business::query()
            ->with([
                'owner:id,first_name,last_name,email',
                'subscription:id,name',
            ])
            ->whereBetween('created_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->latest('created_at')
            ->get();

        $daily = $this->dailySeries($from, $to, $businesses, 'created_at', 'id', true);
        $activeCount = Business::where('status', RecordStatus::Active->value)->count();
        $trialCount = Business::where('access_mode', BusinessAccessMode::Trial->value)->count();
        $withPlanCount = Business::whereNotNull('subscription_id')->count();
        $accessMix = Business::query()
            ->selectRaw('access_mode as label, COUNT(*) as value')
            ->groupBy('access_mode')
            ->orderByDesc('value')
            ->get()
            ->map(fn (object $row): array => [
                'label' => str((string) $row->label)->replace('_', ' ')->title()->toString(),
                'value' => (float) $row->value,
            ])
            ->values();
        $categoryMix = Business::query()
            ->selectRaw('business_category as label, COUNT(*) as value')
            ->groupBy('business_category')
            ->orderByDesc('value')
            ->take(6)
            ->get()
            ->map(fn (object $row): array => [
                'label' => str((string) ($row->label ?: 'Unspecified'))->replace('_', ' ')->title()->toString(),
                'value' => (float) $row->value,
            ])
            ->values();

        return Inertia::render('admin/reports/business-growth', [
            'report' => [
                'title' => 'Business Growth',
                'date_from' => $from->toDateString(),
                'date_to' => $to->toDateString(),
                'summary' => [
                    ['label' => 'New Businesses', 'value' => (string) $businesses->count()],
                    ['label' => 'Active Businesses', 'value' => (string) $activeCount],
                    ['label' => 'Trial Businesses', 'value' => (string) $trialCount],
                    ['label' => 'Businesses With Plans', 'value' => (string) $withPlanCount],
                ],
                'chart' => $daily,
                'accessMix' => $accessMix,
                'categoryMix' => $categoryMix,
                'rows' => $businesses->map(fn (Business $business): array => [
                    'business_name' => $business->business_name,
                    'owner' => $business->owner ? trim(($business->owner->first_name ?? '').' '.($business->owner->last_name ?? '')) ?: $business->owner->email : 'Unassigned',
                    'plan' => $business->subscription?->name ?? 'No plan',
                    'access_mode' => $business->access_mode->label(),
                    'status' => $business->status->value,
                    'created_at' => DateHelper::dateTime($business->created_at),
                ])->values(),
            ],
        ]);
    }

    public function subscriptionAnalytics(Request $request): Response
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $subscriptions = Subscription::query()
            ->withCount('businesses')
            ->orderBy('price')
            ->get();

        $activeAssignments = Business::whereNotNull('subscription_id')->count();
        $businessesWithoutPlan = Business::whereNull('subscription_id')->count();
        $estimatedMonthlyValue = $subscriptions->sum(fn (Subscription $subscription): float => (float) $subscription->price * (int) $subscription->businesses_count);

        return Inertia::render('admin/reports/subscription-analytics', [
            'report' => [
                'title' => 'Subscription Analytics',
                'summary' => [
                    ['label' => 'Plans', 'value' => (string) $subscriptions->count()],
                    ['label' => 'Active Assignments', 'value' => (string) $activeAssignments],
                    ['label' => 'Businesses Without Plan', 'value' => (string) $businessesWithoutPlan],
                    ['label' => 'Estimated MRR', 'value' => CurrencyHelper::money($estimatedMonthlyValue)],
                ],
                'chart' => $subscriptions->map(fn (Subscription $subscription): array => [
                    'label' => str($subscription->name)->limit(14)->toString(),
                    'value' => (int) $subscription->businesses_count,
                ])->values(),
                'revenueChart' => $subscriptions->map(fn (Subscription $subscription): array => [
                    'label' => str($subscription->name)->limit(14)->toString(),
                    'value' => (float) $subscription->price * (int) $subscription->businesses_count,
                ])->values(),
                'assignmentMix' => [
                    ['label' => 'Assigned', 'value' => (float) $activeAssignments],
                    ['label' => 'No plan', 'value' => (float) $businessesWithoutPlan],
                ],
                'rows' => $subscriptions->map(fn (Subscription $subscription): array => [
                    'name' => $subscription->name,
                    'price' => (float) $subscription->price,
                    'duration_months' => $subscription->duration_months,
                    'max_cashiers' => $subscription->max_cashiers,
                    'businesses_count' => $subscription->businesses_count,
                    'estimated_mrr' => (float) $subscription->price * (int) $subscription->businesses_count,
                    'status' => $subscription->status->value,
                ])->values(),
            ],
        ]);
    }

    /**
     * @return array{0: CarbonInterface, 1: CarbonInterface}
     */
    private function range(Request $request): array
    {
        return DateHelper::range(
            $request->string('date_from')->toString() ?: null,
            $request->string('date_to')->toString() ?: null,
        );
    }

    /**
     * @param  \Illuminate\Support\Collection<int, mixed>  $items
     * @return array<int, array{label: string, value: float}>
     */
    private function dailySeries(CarbonInterface $from, CarbonInterface $to, $items, string $dateColumn, string $valueColumn, bool $countOnly = false): array
    {
        $series = [];
        $cursor = $from->copy()->startOfDay();
        $end = $to->copy()->startOfDay();

        while ($cursor <= $end) {
            $date = $cursor->toDateString();
            $matches = collect($items)->filter(fn ($item): bool => Carbon::parse($item->{$dateColumn})->toDateString() === $date);

            $series[] = [
                'label' => DateHelper::label($cursor),
                'value' => $countOnly ? (float) $matches->count() : (float) $matches->sum($valueColumn),
            ];

            $cursor = $cursor->addDay();
        }

        return $series;
    }

    /**
     * @return array<int, array{label: string, value: float, amount: float}>
     */
    private function paymentGatewayMix(): array
    {
        return Payment::query()
            ->selectRaw('method, COUNT(*) as value, COALESCE(SUM(amount), 0) as amount')
            ->groupBy('method')
            ->orderByDesc('amount')
            ->get()
            ->map(fn (object $row): array => [
                'label' => str((string) $row->method)->replace('_', ' ')->title()->toString(),
                'value' => (float) $row->value,
                'amount' => (float) $row->amount,
            ])
            ->values()
            ->all();
    }

}
