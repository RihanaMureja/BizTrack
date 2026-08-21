<?php

namespace App\Services;

use App\Enums\BusinessAccessMode;
use App\Enums\RecordStatus;
use App\Events\BusinessOnboardingCompleted;
use App\Events\BusinessSubscriptionChanged;
use App\Models\Business;
use App\Models\Notification as AppNotification;
use App\Models\Subscription;
use App\Models\User;
use App\Notifications\TrialStartedNotification;

class OnboardingService
{
    public function nextRouteFor(User $user): string
    {
        $business = $user->ownedBusiness;

        if (! $business) {
            return route('onboarding.business-profile');
        }

        if ($business->access_mode === BusinessAccessMode::Onboarding && ! $user->phone) {
            return route('onboarding.verify-phone');
        }

        if ($business->access_mode === BusinessAccessMode::Onboarding) {
            return route('onboarding.choose-plan');
        }

        if ($business->access_mode === BusinessAccessMode::Suspended) {
            return route('onboarding.choose-plan');
        }

        return route('dashboard');
    }

    public function startTrial(Business $business): Business
    {
        $wasIncomplete = $business->onboarding_completed_at === null;

        $business->forceFill([
            'access_mode' => BusinessAccessMode::Trial,
            'status' => RecordStatus::Active,
            'trial_started_at' => now(),
            'trial_ends_at' => now()->addDays(14),
            'onboarding_completed_at' => now(),
        ])->save();

        // Create notification directly using the custom Notification model
        $owner = $business->owner;
        if ($owner) {
            $owner->notify(new TrialStartedNotification($business));

            AppNotification::create([
                'user_id' => $owner->id,
                'business_id' => $business->id,
                'type' => 'trial_started',
                'title' => 'Trial Started',
                'message' => $business->business_name.' trial started.',
                'is_read' => false,
            ]);
        }

        $business = $business->refresh();

        if ($wasIncomplete) {
            BusinessOnboardingCompleted::dispatch($business, BusinessAccessMode::Trial);
        }

        return $business;
    }

    public function activatePaidPlan(Business $business, Subscription $subscription): Business
    {
        $previousSubscriptionId = $business->subscription_id;
        $wasIncomplete = $business->onboarding_completed_at === null;

        $business->forceFill([
            'subscription_id' => $subscription->id,
            'access_mode' => BusinessAccessMode::Active,
            'status' => RecordStatus::Active,
            'onboarding_completed_at' => now(),
        ])->save();

        $business = $business->refresh()->loadMissing('subscription');

        BusinessSubscriptionChanged::dispatch($business, $subscription, $previousSubscriptionId);

        if ($wasIncomplete) {
            BusinessOnboardingCompleted::dispatch($business, BusinessAccessMode::Active);
        }

        return $business;
    }
}
