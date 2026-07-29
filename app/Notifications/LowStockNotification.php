<?php

namespace App\Notifications;

use App\Models\Inventory;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Inventory $inventory) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $product = $this->inventory->product;

        return (new MailMessage)
            ->subject('Low stock alert: '.$product->name)
            ->line($product->name.' has reached '.$this->inventory->available_stock.' available stock.')
            ->line('Reorder level: '.$product->reorder_level.'.');
    }
}
