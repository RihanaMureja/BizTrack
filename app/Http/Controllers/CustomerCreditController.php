<?php

namespace App\Http\Controllers;

use App\Enums\NotificationType;
use App\Http\Requests\StoreCreditRepaymentRequest;
use App\Models\CustomerCredit;
use App\Notifications\CreditReminderNotification;
use App\Services\CustomerCreditService;
use App\Services\NotificationService;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;

class CustomerCreditController extends Controller
{
    public function __construct(
        private readonly CustomerCreditService $customerCreditService,
        private readonly NotificationService $notificationService,
        private readonly PaymentService $paymentService,
    ) {}

    public function overdue(CustomerCredit $customerCredit): RedirectResponse
    {
        $this->authorizeCredit($customerCredit);

        $this->customerCreditService->markOverdue($customerCredit);

        return back()->with('success', 'Credit marked as overdue.');
    }

    public function remind(CustomerCredit $customerCredit): RedirectResponse
    {
        $this->authorizeCredit($customerCredit);

        $credit = $customerCredit->loadMissing(['business.owner', 'customer', 'sale']);
        $owner = $credit->business->owner;

        $this->notificationService->create(
            $credit->business,
            $owner,
            NotificationType::CreditReminder,
            'Credit reminder: '.$credit->customer->display_name,
            $credit->customer->display_name.' has '.$credit->remaining_balance.' ETB due for '.$credit->sale->invoice_number.'.',
        );

        $credit->forceFill(['reminded_at' => now()])->save();
        $owner?->notify(new CreditReminderNotification($credit));

        return back()->with('success', 'Credit reminder sent.');
    }

    public function repay(StoreCreditRepaymentRequest $request, CustomerCredit $customerCredit): RedirectResponse
    {
        $this->authorizeCredit($customerCredit);

        $payments = $this->paymentService->createCustomerCreditRepayment(
            $customerCredit,
            $request->user(),
            $request->validated(),
        );

        $payment = collect($payments)->last();

        return $payment
            ? to_route('payments.show', $payment)->with('success', 'Credit repayment collected.')
            : back()->with('success', 'Credit repayment collected.');
    }

    private function authorizeCredit(CustomerCredit $credit): void
    {
        abort_unless(auth()->user()?->isOwner() || auth()->user()?->isCashier(), 403);
        abort_unless($credit->business_id === (auth()->user()->ownedBusiness?->id ?? auth()->user()->business_id), 403);
    }
}
