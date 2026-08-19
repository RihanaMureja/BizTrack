<?php

namespace App\Http\Controllers;

use App\Enums\BusinessCategory;
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
            'account_type' => $request->string('account_type')->toString() ?: null,
            'status' => $request->string('status')->toString() ?: null,
            'business_category' => $request->string('business_category')->toString() ?: null,
        ];

        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->with(['business:id,business_name,business_category,business_type'])
                ->when($filters['search'], fn (Builder $query, string $search) => $query->where(fn (Builder $searchQuery) => $searchQuery
                    ->where('first_name', 'like', '%'.$search.'%')
                    ->orWhere('last_name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhereHas('business', fn (Builder $businessQuery) => $businessQuery->where('business_name', 'like', '%'.$search.'%'))))
                ->when($filters['account_type'], function (Builder $query, string $accountType): void {
                    match ($accountType) {
                        'employees' => $query->where('role', Role::Cashier),
                        'owners' => $query->where('role', Role::Owner),
                        default => null,
                    };
                })
                ->when($filters['status'], fn (Builder $query, string $status) => $query->where('status', $status))
                ->when($filters['business_category'], fn (Builder $query, string $category) => $query->whereHas('business', fn (Builder $businessQuery) => $businessQuery->where('business_category', $category)))
                ->latest()
                ->paginate(12)
                ->withQueryString(),
            'accountTypes' => [
                ['value' => 'owners', 'label' => 'Business owners'],
                ['value' => 'employees', 'label' => 'Employees'],
            ],
            'statuses' => [
                ['value' => RecordStatus::Active->value, 'label' => 'Active'],
                ['value' => RecordStatus::Inactive->value, 'label' => 'Inactive'],
            ],
            'businessCategories' => collect(BusinessCategory::cases())->map(fn (BusinessCategory $category): array => [
                'value' => $category->value,
                'label' => $category->label(),
            ]),
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
        abort_if($user->role === Role::Cashier, 422, 'Employee status is managed by the business owner, not the platform admin.');

        $data = $request->validate([
            'status' => ['required', Rule::enum(RecordStatus::class)],
        ]);
        $oldValues = $user->only(['status']);
        $user->forceFill($data)->save();

        $this->auditLogService->log('user.status_updated', $user, $user->business, $oldValues, $user->only(['status']), $request->user(), $request);

        return back()->with('success', 'User status updated.');
    }
}
