<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::put('/profile', [AuthController::class, 'updateProfile']);
});

Route::post('/main/bezetting-jenis-kelamin', [\App\Http\Controllers\DashboardController::class, 'bezettingJenisKelamin']);
Route::get('/profil', [\App\Http\Controllers\DashboardController::class, 'profil']);
Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index']);
Route::get('/dashboard/kelompok-asn-detail', [\App\Http\Controllers\DashboardController::class, 'kelompokAsnDetail']);

Route::get('/satuan-kerja', [\App\Http\Controllers\SatuanKerjaController::class, 'index']);
Route::get('/struktur-hierarki-opd', [\App\Http\Controllers\SatuanKerjaController::class, 'strukturHierarki']);

// Klasifikasi Jabatan Routes
Route::get('/klasifikasi-jabatan', [\App\Http\Controllers\KlasifikasiJabatanController::class, 'index']);
Route::get('/klasifikasi-jabatan/statistics', [\App\Http\Controllers\KlasifikasiJabatanController::class, 'statistics']);
Route::get('/klasifikasi-jabatan/manajerial', [\App\Http\Controllers\KlasifikasiJabatanController::class, 'manajerial']);
Route::get('/klasifikasi-jabatan/non-manajerial', [\App\Http\Controllers\KlasifikasiJabatanController::class, 'nonManajerial']);
Route::get('/klasifikasi-jabatan/{id}', [\App\Http\Controllers\KlasifikasiJabatanController::class, 'show']);

// Data Pegawai Aktif Routes
Route::get('/pegawai', [\App\Http\Controllers\DataPegawaiAktifController::class, 'index']);
Route::get('/pegawai/statistics', [\App\Http\Controllers\DataPegawaiAktifController::class, 'statistics']);
Route::get('/pegawai/filters', [\App\Http\Controllers\DataPegawaiAktifController::class, 'filterOptions']);
Route::get('/pegawai/by-jabatan', [\App\Http\Controllers\DataPegawaiAktifController::class, 'byJabatan']);

