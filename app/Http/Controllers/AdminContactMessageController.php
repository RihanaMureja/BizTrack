<?php

namespace App\Http\Controllers;

use App\Enums\ContactMessageSource;
use App\Enums\ContactMessageStatus;
use App\Helpers\DateHelper;
use App\Models\ContactMessage;
use App\Services\ContactMessageService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminContactMessageController extends Controller
{
    public function __construct(private readonly ContactMessageService $contactMessages) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $filters = [
            'search' => $request->string('search')->toString() ?: null,
            'status' => $request->string('status')->toString() ?: null,
            'source' => $request->string('source')->toString() ?: null,
        ];

        $messages = ContactMessage::query()
            ->with(['business:id,business_name,business_category', 'user:id,name,email'])
            ->when($filters['search'], fn (Builder $query, string $search) => $query->where(fn (Builder $searchQuery) => $searchQuery
                ->where('full_name', 'like', '%'.$search.'%')
                ->orWhere('email', 'like', '%'.$search.'%')
                ->orWhere('subject', 'like', '%'.$search.'%')
                ->orWhere('message', 'like', '%'.$search.'%')
                ->orWhereHas('business', fn (Builder $businessQuery) => $businessQuery->where('business_name', 'like', '%'.$search.'%'))))
            ->when($filters['status'], fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['source'], fn (Builder $query, string $source) => $query->where('source', $source))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (ContactMessage $message): array => [
                'id' => $message->id,
                'full_name' => $message->full_name,
                'email' => $message->email,
                'phone' => $message->phone,
                'subject' => $message->subject,
                'message' => $message->message,
                'source' => $message->source->value,
                'source_label' => $message->source->label(),
                'status' => $message->status->value,
                'status_label' => $message->status->label(),
                'ip_address' => $message->ip_address,
                'created_at' => DateHelper::dateTime($message->created_at),
                'business' => $message->business ? [
                    'id' => $message->business->id,
                    'name' => $message->business->business_name,
                    'category' => $message->business->business_category?->label(),
                ] : null,
                'user' => $message->user ? [
                    'id' => $message->user->id,
                    'name' => $message->user->name,
                    'email' => $message->user->email,
                ] : null,
            ]);

        return Inertia::render('admin/inbox/index', [
            'messages' => $messages,
            'summary' => [
                'total' => ContactMessage::query()->count(),
                'new' => ContactMessage::query()->where('status', ContactMessageStatus::New->value)->count(),
                'owner_support' => ContactMessage::query()->where('source', ContactMessageSource::OwnerSupport->value)->count(),
            ],
            'statuses' => collect(ContactMessageStatus::cases())->map(fn (ContactMessageStatus $status): array => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->values(),
            'sources' => collect(ContactMessageSource::cases())->map(fn (ContactMessageSource $source): array => [
                'value' => $source->value,
                'label' => $source->label(),
            ])->values(),
            'filters' => $filters,
        ]);
    }

    public function markRead(Request $request, ContactMessage $contactMessage): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $this->contactMessages->markRead($contactMessage);

        return back();
    }

    public function resolve(Request $request, ContactMessage $contactMessage): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $this->contactMessages->resolve($contactMessage);

        return back();
    }
}
