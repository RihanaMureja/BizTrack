<?php

namespace App\Http\Controllers;

use App\Enums\ContactMessageSource;
use App\Http\Requests\StoreContactMessageRequest;
use App\Services\ContactMessageService;
use Illuminate\Http\RedirectResponse;

class ContactMessageController extends Controller
{
    public function __construct(private readonly ContactMessageService $contactMessages) {}

    public function store(StoreContactMessageRequest $request): RedirectResponse
    {
        $this->contactMessages->create(
            $request->validated(),
            $request,
            ContactMessageSource::Landing,
        );

        return back()->with('success', 'Thanks for contacting BizTrack. Our team will review your message shortly.');
    }
}
