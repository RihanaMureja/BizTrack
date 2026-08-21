<?php

namespace App\Http\Controllers;

use App\Enums\BusinessCategory;
use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\Business;
use App\Models\User;
use App\Helpers\DateHelper;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', AuditLog::class);

        $user = $request->user();
        $filters = [
            'search' => $request->string('search')->toString() ?: null,
            'action' => $request->string('action')->toString() ?: null,
            'date_from' => $request->date('date_from')?->toDateString(),
            'date_to' => $request->date('date_to')?->toDateString(),
            'business_id' => $request->integer('business_id') ?: null,
            'business_category' => $request->string('business_category')->toString() ?: null,
            'user_id' => $request->integer('user_id') ?: null,
            'role' => $request->string('role')->toString() ?: null,
            'action_group' => $request->string('action_group')->toString() ?: null,
            'table_name' => $request->string('table_name')->toString() ?: null,
            'risk_level' => $request->string('risk_level')->toString() ?: null,
        ];

        $query = AuditLog::query()
            ->with(['business:id,business_name,business_category,business_type', 'user:id,first_name,last_name,email,role'])
            ->when($user->role !== Role::SuperAdmin, function (Builder $query) use ($user): void {
                $businessId = $user->ownedBusiness?->id ?? $user->business_id;
                $query->where('business_id', $businessId);
            })
            ->when($filters['search'], fn (Builder $query, string $search) => $query->where(fn (Builder $searchQuery) => $searchQuery
                ->where('action', 'like', '%'.$search.'%')
                ->orWhere('table_name', 'like', '%'.$search.'%')
                ->orWhereHas('user', fn (Builder $userQuery) => $userQuery
                    ->where('first_name', 'like', '%'.$search.'%')
                    ->orWhere('last_name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%'))
                ->orWhereHas('business', fn (Builder $businessQuery) => $businessQuery->where('business_name', 'like', '%'.$search.'%'))))
            ->when($filters['action'], fn (Builder $query, string $action) => $query->where('action', $action))
            ->when($filters['date_from'], fn (Builder $query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'], fn (Builder $query, string $date) => $query->whereDate('created_at', '<=', $date))
            ->latest('created_at');

        if ($user->role === Role::SuperAdmin) {
            $this->applySuperAdminFilters($query, $filters);
        }

        $auditLogs = $query->paginate(12)->withQueryString();
        $auditLogs->getCollection()->transform(fn (AuditLog $log): array => $this->serializeLog($log));

        return Inertia::render('admin/audit-logs/index', [
            'auditLogs' => $auditLogs,
            'actions' => AuditLog::query()
                ->when($user->role !== Role::SuperAdmin, function (Builder $query) use ($user): void {
                    $query->where('business_id', $user->ownedBusiness?->id ?? $user->business_id);
                })
                ->distinct()
                ->orderBy('action')
                ->pluck('action')
                ->values(),
            'isSuperAdmin' => $user->role === Role::SuperAdmin,
            'businesses' => $user->role === Role::SuperAdmin
                ? Business::query()->orderBy('business_name')->get(['id', 'business_name', 'business_category'])->map(fn (Business $business): array => [
                    'id' => $business->id,
                    'name' => $business->business_name,
                    'category' => $business->business_category?->value,
                ])->values()
                : [],
            'businessCategories' => collect(BusinessCategory::cases())->map(fn (BusinessCategory $category): array => [
                'value' => $category->value,
                'label' => $category->label(),
            ])->values(),
            'users' => $user->role === Role::SuperAdmin
                ? User::query()->orderBy('name')->get(['id', 'name', 'email', 'role'])->map(fn (User $actor): array => [
                    'id' => $actor->id,
                    'name' => $actor->name,
                    'email' => $actor->email,
                    'role' => $actor->role->value,
                ])->values()
                : [],
            'roles' => collect(Role::cases())->map(fn (Role $role): array => [
                'value' => $role->value,
                'label' => $role->label(),
            ])->values(),
            'tables' => AuditLog::query()
                ->when($user->role !== Role::SuperAdmin, function (Builder $query) use ($user): void {
                    $query->where('business_id', $user->ownedBusiness?->id ?? $user->business_id);
                })
                ->whereNotNull('table_name')
                ->distinct()
                ->orderBy('table_name')
                ->pluck('table_name')
                ->values(),
            'actionGroups' => $this->actionGroups(),
            'riskLevels' => $this->riskLevels(),
            'quickFilters' => $this->quickFilters(),
            'visuals' => $user->role === Role::SuperAdmin ? $this->visuals($filters) : null,
            'filters' => $filters,
        ]);
    }

    private function serializeLog(AuditLog $log): array
    {
        $actionGroup = $this->classifyActionGroup($log->action, $log->table_name);
        $riskLevel = $this->classifyRisk($log->action, $log->table_name);

        return [
            'id' => $log->id,
            'action' => $log->action,
            'action_group' => $actionGroup,
            'action_group_label' => str($actionGroup)->title()->toString(),
            'risk_level' => $riskLevel,
            'risk_label' => str($riskLevel)->title()->toString(),
            'table_name' => $log->table_name,
            'record_id' => $log->record_id,
            'old_values' => $log->old_values,
            'new_values' => $log->new_values,
            'ip_address' => $log->ip_address,
            'created_at' => DateHelper::dateTime($log->created_at),
            'business' => $log->business ? [
                'id' => $log->business->id,
                'business_name' => $log->business->business_name,
                'business_category' => $log->business->business_category?->value,
                'business_category_label' => $log->business->business_category?->label() ?? 'Not set',
                'business_type' => $log->business->business_type,
            ] : null,
            'user' => $log->user ? [
                'id' => $log->user->id,
                'first_name' => $log->user->first_name,
                'last_name' => $log->user->last_name,
                'name' => $log->user->name,
                'email' => $log->user->email,
                'role' => $log->user->role->value,
                'role_label' => $log->user->role->label(),
            ] : null,
        ];
    }

    private function visuals(array $filters): array
    {
        $logs = AuditLog::query()
            ->with(['business:id,business_name,business_category', 'user:id,role'])
            ->when($filters['date_from'], fn (Builder $query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'], fn (Builder $query, string $date) => $query->whereDate('created_at', '<=', $date))
            ->latest('created_at')
            ->limit(500)
            ->get();

        return [
            'dailyTrend' => $this->dailyTrend($logs),
            'moduleMix' => $logs->groupBy(fn (AuditLog $log): string => $this->classifyActionGroup($log->action, $log->table_name))
                ->map(fn ($items, string $label): array => ['label' => str($label)->title()->toString(), 'value' => (float) $items->count()])
                ->values(),
            'businessMix' => $logs->whereNotNull('business')
                ->groupBy(fn (AuditLog $log): string => $log->business?->business_name ?? 'Platform')
                ->sortByDesc(fn ($items) => $items->count())
                ->take(6)
                ->map(fn ($items, string $label): array => ['label' => $label, 'value' => (float) $items->count()])
                ->values(),
            'riskMix' => $logs->groupBy(fn (AuditLog $log): string => $this->classifyRisk($log->action, $log->table_name))
                ->map(fn ($items, string $label): array => ['label' => str($label)->title()->toString(), 'value' => (float) $items->count()])
                ->values(),
        ];
    }

    private function dailyTrend($logs): array
    {
        $start = now()->subDays(13)->startOfDay();
        $series = [];

        for ($cursor = $start->copy(); $cursor <= now(); $cursor = $cursor->addDay()) {
            $series[] = [
                'label' => $cursor->format('M j'),
                'value' => (float) $logs->filter(fn (AuditLog $log): bool => $log->created_at->toDateString() === $cursor->toDateString())->count(),
            ];
        }

        return $series;
    }

    private function applySuperAdminFilters(Builder $query, array $filters): void
    {
        if ($filters['business_id']) {
            $query->where('business_id', $filters['business_id']);
        }

        if ($filters['business_category']) {
            $query->whereHas('business', function (Builder $businessQuery) use ($filters): void {
                $businessQuery->where('business_category', $filters['business_category']);
            });
        }

        if ($filters['user_id']) {
            $query->where('user_id', $filters['user_id']);
        }

        if ($filters['role']) {
            $query->whereHas('user', function (Builder $userQuery) use ($filters): void {
                $userQuery->where('role', $filters['role']);
            });
        }

        if ($filters['table_name']) {
            $query->where('table_name', $filters['table_name']);
        }

        if ($filters['action_group']) {
            $this->applyActionGroupFilter($query, $filters['action_group']);
        }

        if ($filters['risk_level']) {
            $this->applyRiskFilter($query, $filters['risk_level']);
        }
    }

    private function applyActionGroupFilter(Builder $query, string $group): void
    {
        $tables = $this->actionGroupTables($group);

        $query->where(function (Builder $groupQuery) use ($group, $tables): void {
            $groupQuery->where('action', 'like', $group.'.%');

            if ($tables !== []) {
                $groupQuery->orWhereIn('table_name', $tables);
            }
        });
    }

    private function applyRiskFilter(Builder $query, string $risk): void
    {
        $actions = match ($risk) {
            'critical' => ['deleted', 'deactivated', 'failed', 'force', 'password', 'subscription', 'business.registered'],
            'sensitive' => ['updated', 'changed', 'password', 'role', 'permission', 'salary'],
            'important' => ['created', 'completed', 'approved', 'payment', 'sale'],
            default => [],
        };

        if ($risk === 'normal') {
            $query->where(function (Builder $riskQuery): void {
                $riskQuery->where('action', 'like', 'auth.%')
                    ->orWhere('action', 'like', '%.viewed');
            });

            return;
        }

        $query->where(function (Builder $riskQuery) use ($actions): void {
            foreach ($actions as $action) {
                $riskQuery->orWhere('action', 'like', '%'.$action.'%');
            }
        });
    }

    private function classifyActionGroup(string $action, ?string $tableName): string
    {
        $value = $action.' '.$tableName;

        return match (true) {
            str_contains($value, 'auth') || str_contains($value, 'login') || str_contains($value, 'logout') => 'auth',
            str_contains($value, 'business') => 'business',
            str_contains($value, 'product') || str_contains($value, 'categor') => 'product',
            str_contains($value, 'inventory') || str_contains($value, 'stock') || str_contains($value, 'batch') => 'inventory',
            str_contains($value, 'sale') => 'sales',
            str_contains($value, 'payment') => 'payments',
            str_contains($value, 'expense') || str_contains($value, 'transaction') => 'transactions',
            str_contains($value, 'employee') || str_contains($value, 'cashier') || str_contains($value, 'user') || str_contains($value, 'role') || str_contains($value, 'permission') => 'employees',
            str_contains($value, 'subscription') || str_contains($value, 'plan') => 'subscription',
            default => 'system',
        };
    }

    private function classifyRisk(string $action, ?string $tableName): string
    {
        $value = $action.' '.$tableName;

        return match (true) {
            str_contains($value, 'deleted') || str_contains($value, 'deactivated') || str_contains($value, 'failed') || str_contains($value, 'password') || str_contains($value, 'subscription') => 'critical',
            str_contains($value, 'role') || str_contains($value, 'permission') || str_contains($value, 'salary') || str_contains($value, 'updated') || str_contains($value, 'changed') => 'sensitive',
            str_contains($value, 'created') || str_contains($value, 'completed') || str_contains($value, 'payment') || str_contains($value, 'sale') => 'important',
            default => 'normal',
        };
    }

    private function actionGroupTables(string $group): array
    {
        return match ($group) {
            'business' => ['businesses', 'business_verification_documents'],
            'product' => ['products', 'categories'],
            'inventory' => ['inventory', 'inventory_transactions', 'inventory_batches'],
            'sales' => ['sales', 'sale_items'],
            'payments' => ['payments'],
            'transactions' => ['expenses', 'expense_categories', 'transactions'],
            'employees' => ['users', 'business_roles', 'permissions'],
            'subscription' => ['subscriptions'],
            default => [],
        };
    }

    private function actionGroups(): array
    {
        return collect(['auth', 'business', 'product', 'inventory', 'sales', 'payments', 'transactions', 'employees', 'subscription', 'system'])
            ->map(fn (string $group): array => ['value' => $group, 'label' => str($group)->title()->toString()])
            ->values()
            ->all();
    }

    private function riskLevels(): array
    {
        return collect(['normal', 'important', 'sensitive', 'critical'])
            ->map(fn (string $risk): array => ['value' => $risk, 'label' => str($risk)->title()->toString()])
            ->values()
            ->all();
    }

    private function quickFilters(): array
    {
        return [
            ['label' => 'Today', 'params' => ['date_from' => today()->toDateString(), 'date_to' => today()->toDateString()]],
            ['label' => 'This week', 'params' => ['date_from' => now()->startOfWeek()->toDateString(), 'date_to' => today()->toDateString()]],
            ['label' => 'Auth events', 'params' => ['action_group' => 'auth']],
            ['label' => 'Payment changes', 'params' => ['action_group' => 'payments']],
            ['label' => 'Employee changes', 'params' => ['action_group' => 'employees']],
            ['label' => 'Subscription changes', 'params' => ['action_group' => 'subscription']],
            ['label' => 'Critical only', 'params' => ['risk_level' => 'critical']],
        ];
    }
}
