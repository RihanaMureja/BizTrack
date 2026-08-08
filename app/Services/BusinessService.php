<?php

namespace App\Services;

use App\Enums\BusinessSubscriptionStatus;
use App\Enums\RecordStatus;
use App\Events\BusinessRegistered;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class BusinessService
{
    public function __construct(
        private readonly BusinessVerificationService $businessVerificationService,
        private readonly SubscriptionService $subscriptionService,
    ) {}

    public function paginateForAdmin(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        return Business::query()
            ->with(['owner:id,first_name,last_name,email,role,status', 'subscription:id,name'])
            ->withCount(['users', 'products', 'sales'])
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(fn ($searchQuery) => $searchQuery
                ->where('business_name', 'like', '%'.$search.'%')
                ->orWhere('business_type', 'like', '%'.$search.'%')
                ->orWhere('email', 'like', '%'.$search.'%')
                ->orWhereHas('owner', fn ($ownerQuery) => $ownerQuery->where('email', 'like', '%'.$search.'%'))))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Return the props needed to render the owner's business profile page.
     *
     * @return array{
     *     business: \App\Models\Business|null,
     *     logoUrl: string|null,
     *     usage: array{users_count: int, products_count: int, max_cashiers: int|null},
     *     subscriptions: \Illuminate\Database\Eloquent\Collection<int, \App\Models\Subscription>
     * }
     */
    public function profileData(User $user): array
    {
        $business = $user->ownedBusiness?->load([
            'subscription',
            'verificationDocuments',
            'verificationReviews.reviewer:id,first_name,last_name,email,role,status',
        ]);

        return [
            'business' => $business,
            'logoUrl' => $business?->logo ? route('businesses.logo', $business) : null,
            'usage' => [
                'users_count' => $business?->users()->count() ?? 0,
                'products_count' => $business?->products()->count() ?? 0,
                'max_cashiers' => $business?->subscription?->max_cashiers,
            ],
            'subscriptions' => $this->subscriptionService->activePlans(),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function upsertForOwner(User $owner, array $data): Business
    {
        return DB::transaction(function () use ($owner, $data): Business {
            $existingBusiness = $owner->ownedBusiness;
            $payload = Arr::except($data, [
                'logo',
                'national_id_photo',
                'trade_license',
                'tin_certificate',
                'vat_certificate',
                'rental_agreement',
            ]);

            if (($data['logo'] ?? null) instanceof UploadedFile) {
                $payload['logo'] = $data['logo']->store('business-logos', 'public');
            }

            foreach ([
                'national_id_photo' => 'national_id_photo_path',
                'trade_license' => 'trade_license_path',
                'tin_certificate' => 'tin_certificate_path',
                'vat_certificate' => 'vat_certificate_path',
                'rental_agreement' => 'rental_agreement_path',
            ] as $input => $column) {
                if (($data[$input] ?? null) instanceof UploadedFile) {
                    $payload[$column] = $data[$input]->store('business-verifications', 'public');
                }
            }

            /** @var Business $business */
            $business = Business::updateOrCreate(
                ['owner_id' => $owner->id],
                [
                    ...$payload,
                    'owner_id' => $owner->id,
                    'email' => $payload['email'] ?? $owner->email,
                    'is_vat_registered' => (bool) ($payload['is_vat_registered'] ?? false),
                    'has_physical_shop' => (bool) ($payload['has_physical_shop'] ?? false),
                    'status' => RecordStatus::PendingReview,
                    'submitted_for_review_at' => now(),
                ],
            );

            $owner->forceFill(['business_id' => $business->id])->save();
            $this->businessVerificationService->syncSubmittedDocuments(
                $business,
                $owner,
                Arr::only($business->getAttributes(), [
                    'national_id_photo_path',
                    'trade_license_path',
                    'tin_certificate_path',
                    'vat_certificate_path',
                    'rental_agreement_path',
                ]),
            );

            if (! $existingBusiness) {
                BusinessRegistered::dispatch($business->refresh());
            }

            return $business->refresh();
        });
    }

    public function activate(Business $business): Business
    {
        $business->forceFill(['status' => RecordStatus::Active])->save();

        return $business->refresh();
    }

    public function deactivate(Business $business): Business
    {
        $business->forceFill(['status' => RecordStatus::Inactive])->save();

        return $business->refresh();
    }

    public function assignSubscription(Business $business, int $subscriptionId): Business
    {
        return $this->activateSubscription($business, Subscription::findOrFail($subscriptionId));
    }

    /**
     * Create (or update) the owner's business during onboarding without an admin approval step.
     *
     * @param  array<string, mixed>  $data
     */
    public function setupForOwner(User $owner, array $data): Business
    {
        $business = $owner->ownedBusiness;

        if ($business) {
            $business->forceFill([
                'business_name' => $data['business_name'],
                'business_type' => $data['business_type'],
            ])->save();

            return $business->refresh();
        }

        $business = Business::create([
            'owner_id' => $owner->id,
            'business_name' => $data['business_name'],
            'business_type' => $data['business_type'],
            'email' => $owner->email,
            'status' => RecordStatus::Active,
        ]);

        $owner->forceFill(['business_id' => $business->id])->save();

        BusinessRegistered::dispatch($business);

        return $business;
    }

    public function activateSubscription(Business $business, Subscription $plan): Business
    {
        $business->forceFill([
            'subscription_id' => $plan->id,
            'subscription_status' => BusinessSubscriptionStatus::Active,
            'subscription_started_at' => now(),
            'subscription_ends_at' => $this->subscriptionEndsAt($plan),
        ])->save();

        return $business->refresh();
    }

    public function pendingSubscription(Business $business, Subscription $plan): Business
    {
        $business->forceFill([
            'subscription_id' => $plan->id,
            'subscription_status' => BusinessSubscriptionStatus::Pending,
            'subscription_started_at' => null,
            'subscription_ends_at' => null,
        ])->save();

        return $business->refresh();
    }

    private function subscriptionEndsAt(Subscription $plan): CarbonInterface
    {
        if ($plan->duration_days) {
            return now()->addDays((int) $plan->duration_days);
        }

        return now()->addMonths(max(1, (int) $plan->duration_months));
    }
}
