<?php

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Enums\SubscriptionPaymentStatus;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\User;
use Illuminate\Support\Str;

class SubscriptionPaymentService
{
    public function __construct(
        private readonly ChapaService $chapa,
        private readonly BusinessService $businessService,
    ) {}

    /**
     * Create a pending subscription payment and start a Chapa checkout session.
     */
    public function createPending(Subscription $plan, Business $business, User $user): SubscriptionPayment
    {
        $reference = 'sbt_'.Str::uuid()->toString();
        $amount = (float) $plan->price;

        $payment = SubscriptionPayment::create([
            'business_id' => $business->id,
            'subscription_id' => $plan->id,
            'user_id' => $user->id,
            'amount' => $amount,
            'method' => PaymentMethod::Chapa,
            'status' => SubscriptionPaymentStatus::Pending,
            'reference' => $reference,
        ]);

        $result = $this->chapa->initialize(
            $reference,
            $amount,
            $user->email,
            $user->first_name ?? $user->name,
            $user->last_name,
        );

        if (! $result['ok'] || empty($result['checkout_url'])) {
            $payment->forceFill([
                'status' => SubscriptionPaymentStatus::Failed,
                'chapa_response' => $result,
            ])->save();

            return $payment->refresh();
        }

        $payment->forceFill([
            'checkout_url' => $result['checkout_url'],
            'reference' => $result['reference'] ?? $reference,
        ])->save();

        return $payment->refresh();
    }

    /**
     * Verify the Chapa transaction on the backend. The subscription is only
     * activated when Chapa confirms the payment was actually completed.
     */
    public function verifyAndActivate(SubscriptionPayment $payment): SubscriptionPayment
    {
        if ($payment->status === SubscriptionPaymentStatus::Paid) {
            return $payment;
        }

        $verification = $this->chapa->verify((string) $payment->reference);

        if (! $this->chapa->isConfirmed($verification)) {
            $payment->forceFill([
                'status' => SubscriptionPaymentStatus::Failed,
                'chapa_response' => $verification,
            ])->save();

            return $payment->refresh();
        }

        $payment->forceFill([
            'status' => SubscriptionPaymentStatus::Paid,
            'chapa_response' => $verification,
            'paid_at' => now(),
            'verified_at' => now(),
        ])->save();

        $this->businessService->activateSubscription($payment->business, $payment->subscription);

        return $payment->refresh();
    }
}
