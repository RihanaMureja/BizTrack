<?php

namespace App\Http\Controllers;

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\Business;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminController extends Controller
{
    public function __invoke(Request $request): Response
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $from = now()->subDays(29)->startOfDay();
        $to = now()->endOfDay();
        $mrr = (float) Business::query()
            ->join('subscriptions', 'businesses.subscription_id', '=', 'subscriptions.id')
            ->where('subscriptions.status', RecordStatus::Active->value)
            ->sum('subscriptions.price');

        return Inertia::render('admin/dashboard', [
            'stats' => [
                ['label' => 'Businesses', 'value' => (string) Business::count(), 'trend' => Business::where('status', RecordStatus::Active->value)->count().' active'],
                ['label' => 'Users', 'value' => (string) User::count(), 'trend' => User::where('role', Role::Owner->value)->count().' owners'],
                ['label' => 'Subscriptions', 'value' => (string) Subscription::count(), 'trend' => Subscription::where('status', RecordStatus::Active->value)->count().' active plans'],
                ['label' => 'Platform MRR', 'value' => number_format($mrr, 2).' ETB', 'trend' => 'Active assigned plans'],
            ],
            'growthSeries' => $this->dailyBusinessSeries($from, $to),
            'planRevenue' => $this->planRevenue(),
            'accessMix' => $this->businessDistribution('access_mode'),
            'categoryMix' => $this->businessDistribution('business_category'),
            'gatewayMix' => $this->gatewayMix(),
            'recentBusinesses' => Business::query()
                ->with(['owner:id,first_name,last_name,email,role,status', 'subscription:id,name'])
                ->latest()
                ->take(6)
                ->get(),
            'recentActivity' => AuditLog::query()
                ->with(['user:id,first_name,last_name,email,role', 'business:id,business_name'])
                ->latest('created_at')
                ->take(8)
                ->get(),
        ]);
    }

    /**
     * @return array<int, array{label: string, value: float}>
     */
    private function dailyBusinessSeries(CarbonInterface $from, CarbonInterface $to): array
    {
        $created = Business::query()
            ->whereBetween('created_at', [$from, $to])
            ->get(['id', 'created_at'])
            ->groupBy(fn (Business $business): string => $business->created_at->toDateString());
        $series = [];
        $cursor = $from->copy();

        while ($cursor <= $to) {
            $date = $cursor->toDateString();
            $series[] = [
                'label' => $cursor->format('M j'),
                'value' => (float) ($created->get($date)?->count() ?? 0),
            ];
            $cursor = $cursor->addDay();
        }

        return $series;
    }

    /**
     * @return array<int, array{label: string, value: float, count: int}>
     */
    private function planRevenue(): array
    {
        return Subscription::query()
            ->where('status', RecordStatus::Active->value)
            ->withCount('businesses')
            ->orderByDesc('price')
            ->get()
            ->map(fn (Subscription $subscription): array => [
                'label' => $subscription->name,
                'value' => (float) $subscription->price * (int) $subscription->businesses_count,
                'count' => (int) $subscription->businesses_count,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: float}>
     */
    private function businessDistribution(string $column): array
    {
        return Business::query()
            ->selectRaw($column.' as label, COUNT(*) as total')
            ->groupBy($column)
            ->orderByDesc('total')
            ->get()
            ->map(fn (object $row): array => [
                'label' => str((string) ($row->label ?: 'Unspecified'))->replace('_', ' ')->title()->toString(),
                'value' => (float) $row->total,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: float, amount: float}>
     */
    private function gatewayMix(): array
    {
        return Payment::query()
            ->selectRaw('method, COUNT(*) as total, COALESCE(SUM(amount), 0) as amount')
            ->groupBy('method')
            ->orderByDesc('amount')
            ->get()
            ->map(fn (object $row): array => [
                'label' => str((string) $row->method)->replace('_', ' ')->title()->toString(),
                'value' => (float) $row->total,
                'amount' => (float) $row->amount,
            ])
            ->values()
            ->all();
    }
}
