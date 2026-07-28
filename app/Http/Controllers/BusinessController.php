<?php

namespace App\Http\Controllers;

use App\Models\Business;
use Illuminate\Http\Request;

class BusinessController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'owner_id' => 'required|exists:users,id',
            'business_name' => 'required|string',
            'business_type' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'status' => 'boolean',
        ]);


        $business = Business::create([
            'owner_id' => $request->owner_id,
            'business_name' => $request->business_name,
            'business_type' => $request->business_type,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'status' => $request->status ?? true,
        ]);


        return response()->json([
            'message' => 'Business created successfully',
            'business' => $business
        ]);
    }
}