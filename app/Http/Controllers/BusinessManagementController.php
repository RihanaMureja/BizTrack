<?php

namespace App\Http\Controllers;

use App\Enums\BusinessCategory;
use App\Enums\RecordStatus;
use App\Helpers\DateHelper;
use App\Models\Business;
use App\Services\BusinessService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BusinessManagementController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Business::class);

        $filters = [
            'search' => $request->string('search')->toString() ?: null,
            'status' => $request->string('status')->toString() ?: null,
            'business_category' => $request->string('business_category')->toString() ?: null,
        ];

        $businesses = $this->businessService->paginateForAdmin($filters);
        $businesses->getCollection()->transform(static function (Business $business): array {
            return [
                'id' => $business->id,
                'business_name' => $business->business_name,
                'business_type' => $business->business_type,
                'business_category' => $business->business_category?->value,
                'business_category_label' => $business->business_category?->label() ?? 'Not set',
                'email' => $business->email,
                'phone' => $business->phone,
                'address' => $business->address,
                'status' => $business->status->value,
                'status_label' => str($business->status->value)->replace('_', ' ')->title()->toString(),
                'access_mode' => $business->access_mode->value,
                'access_mode_label' => $business->access_mode->label(),
                'users_count' => $business->users_count,
                'products_count' => $business->products_count,
                'sales_count' => $business->sales_count,
                'created_at' => DateHelper::dateTime($business->created_at),
                'onboarding_completed_at' => DateHelper::dateTime($business->onboarding_completed_at),
                'trial_started_at' => DateHelper::dateTime($business->trial_started_at),
                'trial_ends_at' => DateHelper::dateTime($business->trial_ends_at),
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

        return Inertia::render('admin/businesses/index', [
            'businesses' => $businesses,
            'statuses' => [
                ['value' => RecordStatus::Active->value, 'label' => 'Active'],
                ['value' => RecordStatus::Inactive->value, 'label' => 'Inactive'],
            ],
            'businessCategories' => collect(BusinessCategory::cases())->map(fn (BusinessCategory $category): array => [
                'value' => $category->value,
                'label' => $category->label(),
            ]),
            'filters' => $filters,
        ]);
    }
}
