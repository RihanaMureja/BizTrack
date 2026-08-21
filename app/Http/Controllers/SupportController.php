<?php

namespace App\Http\Controllers;

use App\Enums\ContactMessageSource;
use App\Helpers\DateHelper;
use App\Http\Requests\StoreOwnerSupportMessageRequest;
use App\Models\ContactMessage;
use App\Services\ContactMessageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    public function __construct(private readonly ContactMessageService $contactMessages) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()->isOwner(), 403);

        $business = $request->user()->ownedBusiness;
        $messages = ContactMessage::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->take(8)
            ->get()
            ->map(fn (ContactMessage $message): array => [
                'id' => $message->id,
                'subject' => $message->subject,
                'message' => str($message->message)->limit(140)->toString(),
                'status' => $message->status->value,
                'status_label' => $message->status->label(),
                'created_at' => DateHelper::dateTime($message->created_at),
            ]);

        return Inertia::render('support/index', [
            'contact' => [
                'full_name' => $request->user()->name,
                'email' => $request->user()->email,
                'phone' => $request->user()->phone,
                'business' => $business?->business_name,
            ],
            'messages' => $messages,
        ]);
    }

    public function store(StoreOwnerSupportMessageRequest $request): RedirectResponse
    {
        $this->contactMessages->create(
            $request->validated(),
            $request,
            ContactMessageSource::OwnerSupport,
            $request->user()->ownedBusiness,
            $request->user(),
        );

        return back()->with('success', 'Support request sent to the BizTrack platform team.');
    }
}
