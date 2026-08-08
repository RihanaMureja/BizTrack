<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubscriptionPaymentController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $search = $request->string('search')->toString() ?: null;
        $status = $request->string('status')->toString() ?: null;

        $payments = SubscriptionPayment::query()
            ->with([
                'business:id,owner_id,business_name,subscription_status,subscription_started_at,subscription_ends_at',
                'business.owner:id,first_name,last_name,email',
                'subscription:id,name',
                'user:id,first_name,last_name,email',
            ])
            ->when($search, fn ($query, $search) => $query->whereHas('business', fn ($business) => $business
                ->where('business_name', 'like', '%'.$search.'%')
                ->orWhereHas('owner', fn ($owner) => $owner->where('email', 'like', '%'.$search.'%'))))
            ->when($status, fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('admin/subscription-payments/index', [
            'payments' => $payments,
            'statuses' => [
                ['value' => 'pending', 'label' => 'Pending'],
                ['value' => 'paid', 'label' => 'Paid'],
                ['value' => 'failed', 'label' => 'Failed'],
                ['value' => 'cancelled', 'label' => 'Cancelled'],
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }
}
