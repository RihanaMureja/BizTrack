<?php

namespace App\Http\Controllers;

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\Business;
use App\Models\Subscription;
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
                ['label' => 'Businesses', 'value' => (string) Business::count(), 'trend' => Business::where('status', RecordStatus::Active->value)->count().' active'],
                ['label' => 'Users', 'value' => (string) User::count(), 'trend' => User::where('role', Role::Owner->value)->count().' owners'],
                ['label' => 'Subscriptions', 'value' => (string) Subscription::count(), 'trend' => Subscription::where('status', RecordStatus::Active->value)->count().' active plans'],
                ['label' => 'Platform MRR', 'value' => number_format((float) Business::query()
                    ->join('subscriptions', 'businesses.subscription_id', '=', 'subscriptions.id')
                    ->where('subscriptions.status', RecordStatus::Active->value)
                    ->sum('subscriptions.price'), 2).' ETB', 'trend' => 'Active assigned plans'],
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
