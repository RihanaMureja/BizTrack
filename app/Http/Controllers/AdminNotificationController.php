<?php

namespace App\Http\Controllers;

use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Enums\NotificationType;
use App\Helpers\DateHelper;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminNotificationController extends Controller
{
    public function __construct(private readonly NotificationService $notificationService) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $filters = [
            'search' => $request->string('search')->toString() ?: null,
            'category' => $request->string('category')->toString() ?: null,
            'priority' => $request->string('priority')->toString() ?: null,
            'read' => $request->has('read') && $request->string('read')->toString() !== ''
                ? $request->boolean('read')
                : null,
        ];

        $notifications = $this->notificationService
            ->paginateForUser($request->user(), $filters, 15)
            ->through(fn (Notification $notification): array => [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->message,
                'type' => $notification->type->value,
                'type_label' => $notification->type->label(),
                'category' => $notification->category?->value,
                'category_label' => $notification->category?->label() ?? 'Platform',
                'priority' => $notification->priority?->value ?? NotificationPriority::Normal->value,
                'priority_label' => $notification->priority?->label() ?? NotificationPriority::Normal->label(),
                'is_read' => $notification->is_read,
                'action_url' => $notification->action_url,
                'business' => $notification->business ? [
                    'id' => $notification->business->id,
                    'name' => $notification->business->business_name,
                ] : null,
                'related_user' => $notification->relatedUser ? [
                    'id' => $notification->relatedUser->id,
                    'name' => $notification->relatedUser->name,
                    'email' => $notification->relatedUser->email,
                ] : null,
                'created_at' => DateHelper::dateTime($notification->created_at),
            ]);

        return Inertia::render('admin/notifications/index', [
            'notifications' => $notifications,
            'unreadCount' => $this->notificationService->unreadCountForUser($request->user()),
            'categories' => collect(NotificationCategory::cases())->map(fn (NotificationCategory $category): array => [
                'value' => $category->value,
                'label' => $category->label(),
            ])->values(),
            'priorities' => collect(NotificationPriority::cases())->map(fn (NotificationPriority $priority): array => [
                'value' => $priority->value,
                'label' => $priority->label(),
            ])->values(),
            'types' => collect(NotificationType::cases())
                ->filter(fn (NotificationType $type): bool => str_starts_with($type->value, 'platform_'))
                ->map(fn (NotificationType $type): array => [
                    'value' => $type->value,
                    'label' => $type->label(),
                ])->values(),
            'filters' => $filters,
        ]);
    }

    public function markRead(Request $request, Notification $notification): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);
        $this->authorize('update', $notification);

        $this->notificationService->markRead($notification);

        return back();
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $this->notificationService->markAllReadForUser($request->user());

        return back();
    }

    public function dismiss(Request $request, Notification $notification): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);
        $this->authorize('update', $notification);

        $this->notificationService->dismiss($notification);

        return back();
    }
}
