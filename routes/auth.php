<?php

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
|
| BizTrack uses Laravel Fortify for the active authentication endpoints.
| The Auth controllers in app/Http/Controllers/Auth are kept as explicit
| extension points for custom behavior as the product grows.
|
*/

use App\Http\Controllers\Auth\ForcePasswordResetController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('force-password-reset', [ForcePasswordResetController::class, 'edit'])->name('password.force.edit');
    Route::put('force-password-reset', [ForcePasswordResetController::class, 'update'])->name('password.force.update');
});
