<?php

namespace App\Notifications;

use App\Helpers\CurrencyHelper;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DailySalesNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly int $salesCount, private readonly float $revenue) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Daily sales summary')
            ->line('Sales completed today: '.$this->salesCount.'.')
            ->line('Revenue today: '.CurrencyHelper::money($this->revenue).'.');
    }
}
