<?php

namespace App\Services;

use App\Enums\ContactMessageSource;
use App\Enums\ContactMessageStatus;
use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Enums\NotificationType;
use App\Models\Business;
use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Http\Request;

class ContactMessageService
{
    public function __construct(private readonly PlatformNotificationService $platformNotifications) {}

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data, Request $request, ContactMessageSource $source, ?Business $business = null, ?User $user = null): ContactMessage
    {
        $message = ContactMessage::create([
            'business_id' => $business?->id,
            'user_id' => $user?->id,
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'subject' => $data['subject'],
            'message' => $data['message'],
            'source' => $source,
            'status' => ContactMessageStatus::New,
            'ip_address' => $request->ip(),
            'user_agent' => str($request->userAgent() ?? '')->limit(1000)->toString(),
        ]);

        $this->platformNotifications->notifySuperAdmins(
            NotificationType::PlatformSupportMessage,
            $source === ContactMessageSource::OwnerSupport ? 'Owner support message' : 'New contact message',
            $message->full_name.' sent: '.$message->subject,
            $business,
            $user,
            NotificationCategory::Support,
            $source === ContactMessageSource::OwnerSupport ? NotificationPriority::High : NotificationPriority::Normal,
            route('admin.inbox.index', ['status' => ContactMessageStatus::New->value], false),
        );

        return $message->refresh();
    }

    public function markRead(ContactMessage $message): ContactMessage
    {
        if ($message->status === ContactMessageStatus::New) {
            $message->forceFill([
                'status' => ContactMessageStatus::Read,
                'read_at' => now(),
            ])->save();
        }

        return $message->refresh();
    }

    public function resolve(ContactMessage $message): ContactMessage
    {
        $message->forceFill([
            'status' => ContactMessageStatus::Resolved,
            'read_at' => $message->read_at ?? now(),
            'resolved_at' => now(),
        ])->save();

        return $message->refresh();
    }
}
