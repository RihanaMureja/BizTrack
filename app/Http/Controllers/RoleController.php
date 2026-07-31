<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        return Inertia::render('admin/roles/index', [
            'roles' => collect(Role::cases())->map(fn (Role $role): array => [
                'value' => $role->value,
                'label' => $role->label(),
                'users_count' => User::where('role', $role)->count(),
            ]),
            'permissions' => [
                ['module' => 'Platform', 'permission' => 'View super admin dashboard', 'roles' => ['super_admin']],
                ['module' => 'Businesses', 'permission' => 'Approve and deactivate businesses', 'roles' => ['super_admin']],
                ['module' => 'Users', 'permission' => 'Manage business owners and cashiers', 'roles' => ['super_admin']],
                ['module' => 'Subscriptions', 'permission' => 'Create and manage subscription plans', 'roles' => ['super_admin']],
                ['module' => 'Audit Logs', 'permission' => 'View all platform audit logs', 'roles' => ['super_admin']],
                ['module' => 'Business', 'permission' => 'Manage own business modules', 'roles' => ['owner']],
                ['module' => 'POS', 'permission' => 'Create sales and payments', 'roles' => ['owner', 'cashier']],
            ],
        ]);
    }
}
