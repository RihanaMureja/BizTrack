<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{

    // Get all categories
    public function index()
    {
        $categories = Category::all();

        return response()->json($categories);
    }


    // Create category
    public function store(Request $request)
    {
        $request->validate([
            'business_id' => 'required|exists:businesses,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'boolean',
        ]);


        $category = Category::create([
            'business_id' => $request->business_id,
            'name' => $request->name,
            'description' => $request->description,
            'status' => $request->status ?? true,
        ]);


        return response()->json([
            'message' => 'Category created successfully',
            'category' => $category
        ]);
    }


    // Show one category
    public function show(Category $category)
    {
        return response()->json($category);
    }


    // Update category
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'boolean',
        ]);


        $category->update([
            'name' => $request->name,
            'description' => $request->description,
            'status' => $request->status,
        ]);


        return response()->json([
            'message' => 'Category updated successfully',
            'category' => $category
        ]);
    }


    // Delete category
    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }
}