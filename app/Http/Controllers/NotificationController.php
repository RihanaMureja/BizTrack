<?php

namespace App\Http\Controllers;

use App\Enums\NotificationType;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(private readonly NotificationService $notificationService) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Notification::class);

        $filters = [
            'search' => $request->string('search')->toString() ?: null,
            'type' => $request->string('type')->toString() ?: null,
            'read' => $request->has('read') && $request->string('read')->toString() !== ''
                ? $request->boolean('read')
                : null,
        ];

        return Inertia::render('notifications/index', [
            'notifications' => $this->notificationService->paginateForUser($request->user(), $filters),
            'unreadCount' => $this->notificationService->unreadCountForUser($request->user()),
            'types' => collect(NotificationType::cases())->map(fn (NotificationType $type): array => [
                'value' => $type->value,
                'label' => $type->label(),
            ])->values(),
            'filters' => $filters,
        ]);
    }

    public function markRead(Notification $notification): RedirectResponse
    {
        $this->authorize('update', $notification);

        $this->notificationService->markRead($notification);

        return back();
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $this->authorize('viewAny', Notification::class);

        $this->notificationService->markAllReadForUser($request->user());

        return back();
    }
}
