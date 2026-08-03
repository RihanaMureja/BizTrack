<?php

namespace App\Http\Controllers;

use App\Http\Requests\BusinessRoleRequest;
use App\Models\BusinessPermission;
use App\Models\BusinessRole;
use App\Services\BusinessRoleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BusinessRoleController extends Controller
{
    public function __construct(private readonly BusinessRoleService $businessRoleService) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', BusinessRole::class);

        $business = $request->user()->ownedBusiness ?? $request->user()->business;
        $search = $request->string('search')->toString() ?: null;

        if ($business) {
            $this->businessRoleService->defaultRoleFor($business);
        }

        return Inertia::render('roles/index', [
            'roles' => $business ? $this->businessRoleService->paginateForBusiness($business, $search) : null,
            'permissions' => BusinessPermission::query()->orderBy('group')->orderBy('name')->get(['id', 'key', 'name', 'group', 'description']),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(BusinessRoleRequest $request): RedirectResponse
    {
        $business = $request->user()->ownedBusiness ?? $request->user()->business;
        abort_unless($business, 422);

        $this->authorize('create', BusinessRole::class);
        $this->businessRoleService->create($business, $request->validated());

        return back()->with('success', 'Employee role created.');
    }

    public function update(BusinessRoleRequest $request, BusinessRole $businessRole): RedirectResponse
    {
        $this->authorize('update', $businessRole);
        $this->businessRoleService->update($businessRole, $request->validated());

        return back()->with('success', 'Employee role updated.');
    }

    public function destroy(BusinessRole $businessRole): RedirectResponse
    {
        $this->authorize('delete', $businessRole);
        $businessRole->delete();

        return back()->with('success', 'Employee role deleted.');
    }
}
