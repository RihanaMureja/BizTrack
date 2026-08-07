<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\ProductCodeGeneratorService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;
use Inertia\Response;

class ProductCodeController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly ProductCodeGeneratorService $productCodeGenerator) {}

    public function show(Product $product): Response
    {
        $this->authorize('view', $product);

        if (! $product->barcode || ! $product->qr_payload) {
            $business = $product->business()->firstOrFail();
            $barcode = $product->barcode ?: $this->productCodeGenerator->barcodeFor($business);
            $product->forceFill([
                'barcode' => $barcode,
                'qr_payload' => $this->productCodeGenerator->qrPayloadFor($business, $barcode),
            ])->save();
        }

        return Inertia::render('products/label', [
            'product' => $product->load(['business', 'category']),
        ]);
    }
}
