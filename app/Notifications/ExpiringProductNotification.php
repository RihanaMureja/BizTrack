<?php

namespace App\Notifications;

use App\Models\ProductMovementInsight;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ExpiringProductNotification extends Notification
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
            ->subject('Product nearing expiry')
            ->line($productName . ' is nearing its expiry date.')
            ->line($this->insight->suggested_action ?? 'Review pricing, promotion, or inventory strategy.')
            ->action('View product insights', url('/products/insights'));
    }
}
