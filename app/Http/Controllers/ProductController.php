<?php

namespace App\Http\Controllers;

use App\Enums\RecordStatus;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly ProductService $productService) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Product::class);

        $business = $request->user()->ownedBusiness;
        $search = $request->string('search')->toString() ?: null;
        $categoryId = $request->integer('category_id') ?: null;
        $status = $request->string('status')->toString() ?: null;

        return Inertia::render('products/index', [
            'products' => $business
                ? $this->productService->paginateForBusiness($business, $search, $categoryId, $status)
                : null,
            'categories' => $business
                ? Category::query()
                    ->where('business_id', $business->id)
                    ->orderBy('name')
                    ->get(['id', 'name'])
                : [],
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'status' => $status,
            ],
            'statuses' => collect(RecordStatus::cases())
                ->map(fn (RecordStatus $status) => [
                    'value' => $status->value,
                    'label' => ucfirst($status->value),
                ])
                ->values(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $business = $request->user()->ownedBusiness;

        if (! $business) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Create your business profile before adding products.',
            ]);

            return to_route('business.profile');
        }

        $this->authorize('create', Product::class);

        $product = $this->productService->create($business, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => $product->name.' product created.']);

        return back();
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $this->authorize('update', $product);

        $product = $this->productService->update($product, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => $product->name.' product updated.']);

        return back();
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $this->authorize('delete', $product);

        $this->productService->deactivate($product);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product deactivated.']);

        return back();
    }
}
