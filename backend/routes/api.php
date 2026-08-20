<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/login', [AuthController::class, 'login']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index']);
Route::get('/satuan-kerja', [\App\Http\Controllers\SatuanKerjaController::class, 'index']);
Route::get('/pengembangan-kompetensi', [\App\Http\Controllers\PengembanganKompetensiController::class, 'index']);
Route::get('/layanan', [\App\Http\Controllers\LayananController::class, 'index']);
Route::get('/perencanaan', [\App\Http\Controllers\PerencanaanController::class, 'index']);
