<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{

    // Show all products
    public function index()
    {
        $products = Product::with(['category', 'business'])->get();

        return response()->json($products);
    }


    // Create product
    public function store(Request $request)
    {
        $request->validate([

            'business_id' => 'required|exists:businesses,id',

            'category_id' => 'required|exists:categories,id',

            'product_name' => 'required|string|max:255',

            'sku' => 'required|string|unique:products,sku',

            'buy_price' => 'required|numeric',

            'sell_price' => 'required|numeric',

            'quantity' => 'required|integer|min:0',

            'reorder_level' => 'nullable|integer|min:0',

            'status' => 'boolean',

        ]);


        $product = Product::create([

            'business_id' => $request->business_id,

            'category_id' => $request->category_id,

            'product_name' => $request->product_name,

            'sku' => $request->sku,

            'buy_price' => $request->buy_price,

            'sell_price' => $request->sell_price,

            'quantity' => $request->quantity,

            'reorder_level' => $request->reorder_level ?? 10,

            'status' => $request->status ?? true,

        ]);


        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product
        ]);
    }


    // Show single product
    public function show(Product $product)
    {
        return response()->json($product);
    }


    // Update product
    public function update(Request $request, Product $product)
    {

        $request->validate([

            'product_name' => 'string|max:255',

            'buy_price' => 'numeric',

            'sell_price' => 'numeric',

            'quantity' => 'integer|min:0',

            'status' => 'boolean',

        ]);


        $product->update($request->all());


        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product
        ]);
    }


    // Delete product
    public function destroy(Product $product)
    {
        $product->delete();


        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }
}