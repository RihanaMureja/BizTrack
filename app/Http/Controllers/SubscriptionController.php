<?php

namespace App\Http\Controllers;

use App\Services\SubscriptionService;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function __construct(private readonly SubscriptionService $subscriptionService) {}

    public function index(): Response
    {
        return Inertia::render('business/subscriptions', [
            'subscriptions' => $this->subscriptionService->activePlans(),
        ]);
    }
}
