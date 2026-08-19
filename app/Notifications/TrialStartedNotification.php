<?php

namespace App\Notifications;

use App\Models\Business;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TrialStartedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Business $business) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your BizTrack trial has started')
            ->line($this->business->business_name.' now has full trial access.')
            ->action('Open dashboard', url('/dashboard'));
    }

}
