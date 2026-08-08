<?php

namespace App\Http\Controllers;

use App\Enums\RecordStatus;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Services\SubscriptionPaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class SubscriptionPaymentController extends Controller
{
    public function __construct(private readonly SubscriptionPaymentService $paymentService) {}

    public function show(Request $request): Response|RedirectResponse
    {
        $business = $request->user()?->ownedBusiness;

        if (! $business) {
            return redirect()->route('business.setup');
        }

        if ($business->hasActiveSubscription()) {
            return redirect()->route('dashboard');
        }

        $plan = $request->integer('plan') ? Subscription::find($request->integer('plan')) : null;

        if (! $plan || $plan->status !== RecordStatus::Active || (float) $plan->price <= 0) {
            return redirect()->route('subscriptions.select');
        }

        $returnTo = $request->string('back')->toString();

        if (! in_array($returnTo, ['/business/subscriptions', '/subscriptions'], true)) {
            $returnTo = '/subscriptions';
        }

        return Inertia::render('auth/subscription-payment', [
            'business' => $this->businessPayload($business),
            'plan' => $this->planPayload($plan),
            'returnTo' => $returnTo,
        ]);
    }

    public function initialize(Request $request): RedirectResponse|SymfonyResponse
    {
        $business = $request->user()->ownedBusiness;
        abort_unless($business, 403);

        if ($business->hasActiveSubscription()) {
            return redirect()->route('dashboard');
        }

        $plan = Subscription::findOrFail($request->integer('plan_id'));

        if ($plan->status !== RecordStatus::Active || (float) $plan->price <= 0) {
            return redirect()->route('subscriptions.select');
        }

        $payment = $this->paymentService->createPending($plan, $business, $request->user());

        if ($payment->checkout_url) {
            return Inertia::location($payment->checkout_url);
        }

        return redirect()->route('subscriptions.payment', ['plan' => $plan->id])
            ->with('error', 'Unable to start the payment right now. Please try again.');
    }

    public function callback(Request $request): RedirectResponse
    {
        $reference = $request->string('reference')->toString() ?: $request->string('trxref')->toString();

        $payment = SubscriptionPayment::query()
            ->where('reference', $reference)
            ->first();

        if (! $payment) {
            return redirect()->route('subscriptions.select')
                ->with('error', 'We could not find the payment reference.');
        }

        $this->paymentService->verifyAndActivate($payment);

        if ($payment->status->value === 'paid') {
            return redirect()->route('dashboard')->with('status', 'Payment verified. Your '.$payment->subscription->name.' plan is now active.');
        }

        return redirect()->route('subscriptions.payment', ['plan' => $payment->subscription_id])
            ->with('error', 'Payment was not completed or could not be verified. You can try again.');
    }

    /**
     * @return array<string, mixed>
     */
    private function businessPayload(Business $business): array
    {
        return [
            'id' => $business->id,
            'business_name' => $business->business_name,
            'business_type' => $business->business_type,
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
            'features' => $plan->features ?? [],
        ];
    }
}
