<?php

namespace App\Notifications;

use App\Models\Business;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TrialExpiringNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Business $business) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your BizTrack trial is ending soon')
            ->line($this->business->business_name.' trial is almost over.')
            ->action('Choose a plan', url('/onboarding/choose-plan'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'trial_expiring',
            'business_id' => $this->business->id,
            'message' => $this->business->business_name.' trial is ending soon.',
        ];
    }
}
