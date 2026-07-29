<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentReceivedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Payment $payment) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $payment = $this->payment->loadMissing('sale');

        return (new MailMessage)
            ->subject('Payment received: '.$payment->payment_number)
            ->line($payment->amount.' ETB was recorded for '.$payment->sale->invoice_number.'.')
            ->line('Method: '.$payment->method->label().'.');
    }
}
