<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ExpenseCategoryController;
use App\Http\Controllers\ExpenseController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('categories', CategoryController::class);
Route::apiResource('products', ProductController::class);
Route::post('users', [UserController::class, 'store']);
Route::post('businesses', [BusinessController::class, 'store']);
Route::post('orders', [OrderController::class, 'store']);
Route::put('orders/{id}/complete', [OrderController::class, 'complete']);
Route::post('customers', [CustomerController::class, 'store']);
Route::apiResource('expenses', ExpenseController::class);
Route::apiResource('expense-categories', ExpenseCategoryController::class);
