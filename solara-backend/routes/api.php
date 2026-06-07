<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ForecastController;

// ─── PUBLIC ROUTES  ─────────────────────────
Route::post('/auth/login',    [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// ─── AUTHENTICATED ROUTES (need Sanctum token) ───────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Categories — view: any auth | create: admin only
    Route::get('/categories',        [CategoryController::class, 'index']);
    Route::post('/categories',       [CategoryController::class, 'store'])->middleware('role:admin');

    // Menu Items — view: any auth | manage: admin only
    Route::get('/menu-items',        [MenuController::class, 'index']);
    Route::post('/menu-items',       [MenuController::class, 'store'])->middleware('role:admin');
    Route::put('/menu-items/{id}',   [MenuController::class, 'update'])->middleware('role:admin');
    Route::delete('/menu-items/{id}',[MenuController::class, 'destroy'])->middleware('role:admin');

    // Orders
    Route::get('/orders/my',               [OrderController::class, 'myOrders'])->middleware('role:customer');
    Route::get('/orders',                  [OrderController::class, 'index'])->middleware('role:admin,staff');
    Route::post('/orders',                 [OrderController::class, 'store'])->middleware('role:staff,customer');
    Route::put('/orders/{id}/status',      [OrderController::class, 'updateStatus'])->middleware('role:staff');

    // Inventory
    Route::get('/inventory',               [InventoryController::class, 'index'])->middleware('role:admin,staff');
    Route::post('/inventory/restock',      [InventoryController::class, 'restock'])->middleware('role:admin');

    // Reports — admin only
    Route::get('/reports/sales',           [ReportController::class, 'sales'])->middleware('role:admin');

    // ML Forecast — admin only
    Route::get('/forecast',                [ForecastController::class, 'getForecast'])->middleware('role:admin');
    Route::get('/users', function () {
    return response()->json(\App\Models\User::all());
})->middleware(['auth:sanctum', 'role:admin']);
    });