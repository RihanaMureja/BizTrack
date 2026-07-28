<?php

namespace App\Http\Controllers;

use App\Models\ExpenseCategory;
use Illuminate\Http\Request;

class ExpenseCategoryController extends Controller
{
    // Get all expense categories
    public function index()
    {
        return response()->json(
            ExpenseCategory::all()
        );
    }


    // Create expense category
    public function store(Request $request)
    {
        $request->validate([
            'business_id' => 'required|exists:businesses,id',
            'name' => 'required|string|max:255',
        ]);


        $category = ExpenseCategory::create([
            'business_id' => $request->business_id,
            'name' => $request->name,
        ]);


        return response()->json([
            'message' => 'Expense category created successfully',
            'category' => $category
        ], 201);
    }


    // Show one category
    public function show(ExpenseCategory $expenseCategory)
    {
        return response()->json($expenseCategory);
    }


    // Update category
    public function update(Request $request, ExpenseCategory $expenseCategory)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);


        $expenseCategory->update([
            'name' => $request->name
        ]);


        return response()->json([
            'message' => 'Expense category updated successfully',
            'category' => $expenseCategory
        ]);
    }


   // Delete category
public function destroy(ExpenseCategory $expenseCategory)
{
    $expenseCategory->delete();

    return response()->json([
        'message' => 'Expense category deleted successfully'
    ]);
}
}