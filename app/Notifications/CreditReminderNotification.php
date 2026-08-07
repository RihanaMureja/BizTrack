<?php

namespace App\Notifications;

use App\Models\CustomerCredit;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CreditReminderNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly CustomerCredit $credit) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $credit = $this->credit->loadMissing(['customer', 'sale']);

        return (new MailMessage)
            ->subject('Credit reminder: '.$credit->customer->display_name)
            ->line($credit->customer->display_name.' has '.$credit->remaining_balance.' ETB remaining on '.$credit->sale->invoice_number.'.')
            ->line('Due date: '.($credit->due_date?->toFormattedDateString() ?? 'Not set').'.');
    }
}
