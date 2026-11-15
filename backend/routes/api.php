<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SatuanKerjaController;
use App\Http\Controllers\KlasifikasiJabatanController;
use App\Http\Controllers\DataPegawaiAktifController;

// Public Route (Hanya Login yang dapat diakses tanpa autentikasi)
Route::post('/login', [AuthController::class, 'login'])->name('login');

// Authenticated Routes (Wajib Login untuk seluruh peran: User, Admin, Super Admin)
Route::middleware('auth:sanctum')->group(function () {

    // 1. Profil & Akun Pengguna Aktif (User, Admin, Super Admin)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // 2. Data Dashboard Eksekutif (User, Admin, Super Admin)
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::post('/main/bezetting-jenis-kelamin', [DashboardController::class, 'bezettingJenisKelamin']);
    Route::get('/satuan-kerja', [SatuanKerjaController::class, 'index']);
    Route::get('/dashboard/kelompok-asn-detail', [DashboardController::class, 'kelompokAsnDetail']);

    // 3. Data Internal Kepegawaian & Analisis Formasi (Hanya Admin dan Super Admin)
    Route::middleware('role:admin,super_admin')->group(function () {
        Route::get('/profil', [DashboardController::class, 'profil']);
        Route::get('/struktur-hierarki-opd', [SatuanKerjaController::class, 'strukturHierarki']);

        // Klasifikasi Jabatan Routes (Anjab/ABK & Gap Formasi)
        Route::get('/klasifikasi-jabatan', [KlasifikasiJabatanController::class, 'index']);
        Route::get('/klasifikasi-jabatan/statistics', [KlasifikasiJabatanController::class, 'statistics']);
        Route::get('/klasifikasi-jabatan/manajerial', [KlasifikasiJabatanController::class, 'manajerial']);
        Route::get('/klasifikasi-jabatan/non-manajerial', [KlasifikasiJabatanController::class, 'nonManajerial']);
        Route::get('/klasifikasi-jabatan/{id}', [KlasifikasiJabatanController::class, 'show']);

        // Data Pegawai Aktif Routes (Direktori Pegawai)
        Route::get('/pegawai', [DataPegawaiAktifController::class, 'index']);
        Route::get('/pegawai/statistics', [DataPegawaiAktifController::class, 'statistics']);
        Route::get('/pegawai/filters', [DataPegawaiAktifController::class, 'filterOptions']);
        Route::get('/pegawai/by-jabatan', [DataPegawaiAktifController::class, 'byJabatan']);
    });

    // 4. Modul Manajemen Pengguna / Akun (Khusus Super Admin)
    Route::middleware('role:super_admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });
});
