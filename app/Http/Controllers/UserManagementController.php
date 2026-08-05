<?php

namespace App\Http\Controllers;

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);
        abort_unless($request->user()->isSuperAdmin(), 403);

        $filters = [
            'search' => $request->string('search')->toString() ?: null,
            'role' => $request->string('role')->toString() ?: null,
            'status' => $request->string('status')->toString() ?: null,
        ];

        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->with(['business:id,business_name'])
                ->when($filters['search'], fn (Builder $query, string $search) => $query->where(fn (Builder $searchQuery) => $searchQuery
                    ->where('first_name', 'like', '%'.$search.'%')
                    ->orWhere('last_name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhereHas('business', fn (Builder $businessQuery) => $businessQuery->where('business_name', 'like', '%'.$search.'%'))))
                ->when($filters['role'], fn (Builder $query, string $role) => $query->where('role', $role))
                ->when($filters['status'], fn (Builder $query, string $status) => $query->where('status', $status))
                ->latest()
                ->paginate(12)
                ->withQueryString(),
            'roles' => collect(Role::cases())->map(fn (Role $role): array => ['value' => $role->value, 'label' => $role->label()]),
            'statuses' => collect(RecordStatus::cases())->map(fn (RecordStatus $status): array => ['value' => $status->value, 'label' => ucfirst($status->value)]),
            'filters' => $filters,
            'currentUserId' => $request->user()->id,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);
        abort_unless($request->user()->isSuperAdmin(), 403);
        abort_if($request->user()->is($user), 422, 'You cannot update your own super admin account from this screen.');
        abort_if($user->isSuperAdmin(), 422, 'Super admin accounts cannot be changed from this screen.');

        $data = $request->validate([
            'status' => ['required', Rule::enum(RecordStatus::class)],
        ]);
        $oldValues = $user->only(['status']);
        $user->forceFill($data)->save();

        $this->auditLogService->log('user.status_updated', $user, $user->business, $oldValues, $user->only(['status']), $request->user(), $request);

        return back()->with('success', 'User status updated.');
    }
}
