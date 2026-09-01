<?php

namespace App\Http\Controllers;

use App\Models\Perpustakaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PerpustakaanController extends Controller
{
    /**
     * Mengambil daftar koleksi perpustakaan dengan filter dan KPI
     */
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $startTime = microtime(true);

        $kategoriFilter = $request->query('kategori', 'Semua');
        $tahunFilter    = $request->query('tahun', 'Semua');
        $search         = $request->query('search', '');

        $query = Perpustakaan::query();

        if ($kategoriFilter && $kategoriFilter !== 'Semua') {
            $query->where('kategori', $kategoriFilter);
        }

        if ($tahunFilter && $tahunFilter !== 'Semua') {
            $query->where('tahun', $tahunFilter);
        }

        if ($search) {
            $keyword = "%{$search}%";
            $query->where(function ($q) use ($keyword) {
                $q->where('judul', 'like', $keyword)
                  ->orWhere('nomor_dokumen', 'like', $keyword)
                  ->orWhere('penulis', 'like', $keyword)
                  ->orWhere('penerbit', 'like', $keyword)
                  ->orWhere('deskripsi', 'like', $keyword);
            });
        }

        $allData = Perpustakaan::all();
        $filteredData = $query->orderBy('is_featured', 'desc')->orderBy('tahun', 'desc')->get();

        // ── Ringkasan KPI Stats ───────────────────────────────────────────────
        $ringkasan = [
            'total_koleksi'  => $allData->count(),
            'total_regulasi' => $allData->where('kategori', 'Regulasi')->count(),
            'total_modul'    => $allData->where('kategori', 'Modul Diklat')->count(),
            'total_sop'      => $allData->where('kategori', 'SOP Layanan')->count(),
            'total_jurnal'   => $allData->where('kategori', 'Jurnal')->count(),
            'total_unduhan'  => $allData->sum('jumlah_unduh'),
        ];

        // ── Daftar Kategori & Tahun untuk Filter ───────────────────────────────
        $kategoriList = Perpustakaan::distinct()->orderBy('kategori')->pluck('kategori');
        $tahunList    = Perpustakaan::distinct()->orderByDesc('tahun')->pluck('tahun');

        $executionTime = round((microtime(true) - $startTime) * 1000, 2);
        Log::info("[PerpustakaanController] Query executed in {$executionTime}ms");

        return response()->json([
            'status'        => 'success',
            'data'          => $filteredData,
            'ringkasan'     => $ringkasan,
            'kategori_list' => $kategoriList,
            'tahun_list'    => $tahunList,
            'total_filtered'=> $filteredData->count(),
        ]);
    }

    /**
     * Detail satu dokumen perpustakaan
     */
    public function show($id): \Illuminate\Http\JsonResponse
    {
        $item = Perpustakaan::find($id);

        if (!$item) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Dokumen tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $item,
        ]);
    }

    /**
     * Increment download counter
     */
    public function unduh($id): \Illuminate\Http\JsonResponse
    {
        $item = Perpustakaan::find($id);

        if (!$item) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Dokumen tidak ditemukan',
            ], 404);
        }

        $item->increment('jumlah_unduh');

        return response()->json([
            'status'        => 'success',
            'message'       => 'Download berhasil dicatat',
            'jumlah_unduh'  => $item->jumlah_unduh,
        ]);
    }
}
