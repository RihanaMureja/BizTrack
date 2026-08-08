<?php

namespace App\Http\Controllers;

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\Business;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminController extends Controller
{
    public function __invoke(Request $request): Response
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                ['label' => 'Businesses', 'value' => (string) Business::count(), 'trend' => Business::where('status', RecordStatus::Active)->count().' active'],
                ['label' => 'Users', 'value' => (string) User::count(), 'trend' => User::where('role', Role::Owner)->count().' owners'],
                ['label' => 'Subscriptions', 'value' => (string) Subscription::count(), 'trend' => Subscription::where('status', RecordStatus::Active)->count().' active plans'],
                ['label' => 'Payment Volume', 'value' => number_format((float) Payment::sum('amount') + (float) SubscriptionPayment::where('status', 'paid')->sum('amount'), 2).' ETB', 'trend' => 'Recorded platform payments'],
            ],
            'recentBusinesses' => Business::query()
                ->with(['owner:id,first_name,last_name,email,role,status', 'subscription:id,name'])
                ->latest()
                ->take(6)
                ->get(),
            'recentActivity' => AuditLog::query()
                ->with(['user:id,first_name,last_name,email,role', 'business:id,business_name'])
                ->latest('created_at')
                ->take(8)
                ->get(),
        ]);
    }
}
