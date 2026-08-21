<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly string $token) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        return (new MailMessage)
            ->subject('Reset your BizTrack password')
            ->view('emails.auth.reset-password', [
                'user' => $notifiable,
                'resetUrl' => $resetUrl,
                'expiresIn' => config('auth.passwords.users.expire', 60),
                'logoUrl' => config('app.email_logo_url', asset('brand/biztrack-logo.jpg')),
            ]);
    }
}
