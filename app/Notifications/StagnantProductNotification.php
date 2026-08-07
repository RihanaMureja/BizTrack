<?php

namespace App\Notifications;

use App\Models\ProductMovementInsight;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StagnantProductNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly ProductMovementInsight $insight) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $productName = $this->insight->product?->name ?? 'A product';

        return (new MailMessage)
            ->subject('Stagnant product detected')
            ->line($productName.' has not sold for '.$this->insight->days_without_sale.' days.')
            ->line($this->insight->suggested_action ?? 'Review pricing, promotion, or stocking strategy.')
            ->action('View product detail', url('/products/'.$this->insight->product_id));
    }
}
