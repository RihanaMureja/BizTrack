<?php

namespace App\Services;

use App\Enums\RecordStatus;
use App\Models\Business;
use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductService
{
    public function paginateForBusiness(
        Business $business,
        ?string $search = null,
        ?int $categoryId = null,
        ?string $status = null,
        int $perPage = 10,
    ): LengthAwarePaginator {
        return Product::query()
            ->with(['category', 'inventory'])
            ->where('business_id', $business->id)
            ->when($search, function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('name', 'like', '%'.$search.'%')
                        ->orWhere('barcode', 'like', '%'.$search.'%');
                });
            })
            ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(Business $business, array $data): Product
    {
        return Product::create([
            ...$data,
            'business_id' => $business->id,
        ])->load(['category', 'inventory']);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        return $product->refresh()->load(['category', 'inventory']);
    }

    public function deactivate(Product $product): Product
    {
        $product->update(['status' => RecordStatus::Inactive]);

        return $product->refresh();
    }
}
