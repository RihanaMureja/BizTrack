<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly CategoryService $categoryService) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Category::class);

        $business = $request->user()->ownedBusiness;
        $search = $request->string('search')->toString() ?: null;

        return Inertia::render('categories/index', [
            'categories' => $business
                ? $this->categoryService->paginateForBusiness($business, $search)
                : null,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $business = $request->user()->ownedBusiness;

        if (! $business) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Create your business profile before adding categories.',
            ]);

            return to_route('business.profile');
        }

        $this->authorize('create', Category::class);

        $category = $this->categoryService->create($business, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => $category->name.' category created.']);

        return back();
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $this->authorize('update', $category);

        $category = $this->categoryService->update($category, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => $category->name.' category updated.']);

        return back();
    }

    public function destroy(Request $request, Category $category): RedirectResponse
    {
        $this->authorize('delete', $category);

        $this->categoryService->delete($category);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category deleted.']);

        return back();
    }
}
