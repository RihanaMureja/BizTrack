<?php

namespace App\Notifications;

use App\Models\Business;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BusinessApprovedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Business $business) {}

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
            ->subject('Your BizTrack business is active')
            ->greeting('Welcome to BizTrack')
            ->line($this->business->business_name.' is now ready to use.')
            ->action('Open dashboard', url('/dashboard'));
    }

}
