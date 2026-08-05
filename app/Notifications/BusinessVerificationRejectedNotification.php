<?php

namespace App\Notifications;

use App\Models\Business;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BusinessVerificationRejectedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Business $business,
        private readonly string $reason,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('BizTrack business verification rejected')
            ->greeting('Business verification update')
            ->line($this->business->business_name.' could not be approved.')
            ->line('Reason: '.$this->reason)
            ->action('Update business profile', url('/business/profile'));
    }
}
