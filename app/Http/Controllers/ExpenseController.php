<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{

    // Get all expenses
    public function index()
    {
        return response()->json(
            Expense::with('category')->get()
        );
    }


    // Create expense
    public function store(Request $request)
    {
        $request->validate([

            'business_id' => 'required|exists:businesses,id',

            'category_id' => 'required|exists:expense_categories,id',

            'amount' => 'required|numeric|min:0',

            'description' => 'nullable|string',

            'date' => 'required|date',

        ]);


        $expense = Expense::create([

            'business_id' => $request->business_id,

            'category_id' => $request->category_id,

            'amount' => $request->amount,

            'description' => $request->description,

            'date' => $request->date,

        ]);


        return response()->json([
            'message' => 'Expense created successfully',
            'expense' => $expense->load('category')
        ], 201);
    }



    // Show one expense
    public function show(Expense $expense)
    {
        return response()->json(
            $expense->load('category')
        );
    }



    // Update expense
    public function update(Request $request, Expense $expense)
    {

        $request->validate([

            'category_id' => 'exists:expense_categories,id',

            'amount' => 'numeric|min:0',

            'description' => 'nullable|string',

            'date' => 'date',

        ]);


        $expense->update($request->all());


        return response()->json([
            'message' => 'Expense updated successfully',
            'expense' => $expense
        ]);
    }




    // Delete expense
    public function destroy(Expense $expense)
    {
        $expense->delete();


        return response()->json([
            'message' => 'Expense deleted successfully'
        ]);
    }
}
