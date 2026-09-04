<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/login', [AuthController::class, 'login']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/main/bezetting-jenis-kelamin', [\App\Http\Controllers\DashboardController::class, 'bezettingJenisKelamin']);
Route::get('/profil', [\App\Http\Controllers\DashboardController::class, 'profil']);
Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index']);

Route::get('/satuan-kerja', [\App\Http\Controllers\SatuanKerjaController::class, 'index']);
Route::get('/struktur-hierarki-opd', [\App\Http\Controllers\SatuanKerjaController::class, 'strukturHierarki']);
Route::get('/pengembangan-kompetensi', [\App\Http\Controllers\PengembanganKompetensiController::class, 'index']);
Route::get('/pengembangan-kompetensi/{nip}/history', [\App\Http\Controllers\PengembanganKompetensiController::class, 'history']);
Route::get('/layanan', [\App\Http\Controllers\LayananController::class, 'index']);
Route::get('/perencanaan', [\App\Http\Controllers\PerencanaanController::class, 'index']);
Route::get('/tracking', [\App\Http\Controllers\TrackingController::class, 'index']);
Route::get('/tracking/{id}', [\App\Http\Controllers\TrackingController::class, 'show']);
Route::get('/perpustakaan', [\App\Http\Controllers\PerpustakaanController::class, 'index']);
Route::get('/perpustakaan/{id}', [\App\Http\Controllers\PerpustakaanController::class, 'show']);
Route::post('/perpustakaan/{id}/unduh', [\App\Http\Controllers\PerpustakaanController::class, 'unduh']);

// Pemberhentian Routes
Route::get('/pemberhentian', [\App\Http\Controllers\PemberhentianController::class, 'index']);
Route::get('/pemberhentian/statistics', [\App\Http\Controllers\PemberhentianController::class, 'statistics']);
Route::get('/pemberhentian/{id}', [\App\Http\Controllers\PemberhentianController::class, 'show']);
Route::post('/pemberhentian/{id}/send-email', [\App\Http\Controllers\PemberhentianController::class, 'sendEmail']);
Route::put('/pemberhentian/{id}/update-status', [\App\Http\Controllers\PemberhentianController::class, 'updateStatus']);

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

