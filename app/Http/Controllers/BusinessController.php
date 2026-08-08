<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBusinessRequest;
use App\Http\Requests\UpdateBusinessRequest;
use App\Services\BusinessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService,
    ) {}

    public function show(Request $request): Response
    {
        return Inertia::render('business/profile', $this->businessService->profileData($request->user()));
    }

    public function store(StoreBusinessRequest $request): RedirectResponse
    {
        $business = $this->businessService->upsertForOwner($request->user(), $request->validated());

        return to_route('business.profile')->with('success', $business->business_name.' profile created.');
    }

    public function update(UpdateBusinessRequest $request): RedirectResponse
    {
        $business = $this->businessService->upsertForOwner($request->user(), $request->validated());

        return to_route('business.profile')->with('success', $business->business_name.' profile updated.');
    }
}
