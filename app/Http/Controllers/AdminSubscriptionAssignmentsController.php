<?php

namespace App\Http\Controllers;

use App\Enums\BusinessAccessMode;
use App\Helpers\DateHelper;
use App\Models\Business;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubscriptionAssignmentsController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $filters = [
            'search' => $request->string('search')->toString() ?: null,
            'status' => $request->string('status')->toString() ?: null,
        ];

        $businesses = Business::query()
            ->whereNotNull('subscription_id')
            ->with([
                'owner:id,first_name,last_name,email,role,status',
                'subscription:id,name,price,duration_months,max_cashiers,status',
            ])
            ->withCount('users')
            ->when($filters['search'], fn (Builder $query, string $search) => $query->where(fn (Builder $searchQuery) => $searchQuery
                ->where('business_name', 'like', '%'.$search.'%')
                ->orWhere('email', 'like', '%'.$search.'%')
                ->orWhereHas('owner', fn (Builder $ownerQuery) => $ownerQuery
                    ->where('email', 'like', '%'.$search.'%')
                    ->orWhere('first_name', 'like', '%'.$search.'%')
                    ->orWhere('last_name', 'like', '%'.$search.'%'))
                ->orWhereHas('subscription', fn (Builder $subscriptionQuery) => $subscriptionQuery->where('name', 'like', '%'.$search.'%'))))
            ->when($filters['status'], fn (Builder $query, string $status) => $query->where('access_mode', $status))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $businesses->getCollection()->transform(static function (Business $business): array {
            return [
                'id' => $business->id,
                'business_name' => $business->business_name,
                'business_type' => $business->business_type,
                'status' => $business->status->value,
                'status_label' => str($business->status->value)->replace('_', ' ')->title()->toString(),
                'access_mode' => $business->access_mode->value,
                'access_mode_label' => $business->access_mode->label(),
                'trial_started_at' => DateHelper::date($business->trial_started_at),
                'trial_ends_at' => DateHelper::date($business->trial_ends_at),
                'renewal' => $business->trial_ends_at ? DateHelper::dateTime($business->trial_ends_at) : 'Not tracked',
                'onboarding_completed_at' => DateHelper::date($business->onboarding_completed_at),
                'users_count' => $business->users_count,
                'owner' => $business->owner ? [
                    'name' => trim(($business->owner->first_name ?? '').' '.($business->owner->last_name ?? '')) ?: $business->owner->email,
                    'email' => $business->owner->email,
                ] : null,
                'subscription' => $business->subscription ? [
                    'name' => $business->subscription->name,
                    'price' => (float) $business->subscription->price,
                    'duration_months' => $business->subscription->duration_months,
                    'max_cashiers' => $business->subscription->max_cashiers,
                    'status' => $business->subscription->status->value,
                ] : null,
            ];
        });

        return Inertia::render('admin/subscriptions/assignments', [
            'businesses' => $businesses,
            'statusOptions' => collect(BusinessAccessMode::cases())->map(fn (BusinessAccessMode $status): array => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->values(),
            'filters' => $filters,
            'note' => 'This is a current-state snapshot of business plan assignments. Renewal dates are only shown when trial dates exist; platform billing history is not stored yet.',
        ]);
    }
}
