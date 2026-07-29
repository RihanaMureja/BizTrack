<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\User;
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
        ];

        $query = AuditLog::query()
            ->with(['business:id,business_name', 'user:id,first_name,last_name,email,role'])
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

        return Inertia::render('admin/audit-logs/index', [
            'auditLogs' => $query->paginate(12)->withQueryString(),
            'actions' => AuditLog::query()
                ->when($user->role !== Role::SuperAdmin, function (Builder $query) use ($user): void {
                    $query->where('business_id', $user->ownedBusiness?->id ?? $user->business_id);
                })
                ->distinct()
                ->orderBy('action')
                ->pluck('action')
                ->values(),
            'filters' => $filters,
        ]);
    }
}
