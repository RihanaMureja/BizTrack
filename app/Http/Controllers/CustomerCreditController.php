<?php

namespace App\Http\Controllers;

use App\Enums\NotificationType;
use App\Models\CustomerCredit;
use App\Notifications\CreditReminderNotification;
use App\Services\CustomerCreditService;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;

class CustomerCreditController extends Controller
{
    public function __construct(
        private readonly CustomerCreditService $customerCreditService,
        private readonly NotificationService $notificationService,
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
            'Credit reminder: '.$credit->customer->full_name,
            $credit->customer->full_name.' has '.$credit->remaining_balance.' ETB due for '.$credit->sale->invoice_number.'.',
        );

        $credit->forceFill(['reminded_at' => now()])->save();
        $owner?->notify(new CreditReminderNotification($credit));

        return back()->with('success', 'Credit reminder sent.');
    }

    private function authorizeCredit(CustomerCredit $credit): void
    {
        abort_unless(auth()->user()?->isOwner() || auth()->user()?->isCashier(), 403);
        abort_unless($credit->business_id === (auth()->user()->ownedBusiness?->id ?? auth()->user()->business_id), 403);
    }
}
