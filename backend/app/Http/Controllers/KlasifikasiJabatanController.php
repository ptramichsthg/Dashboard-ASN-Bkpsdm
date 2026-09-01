<?php

namespace App\Http\Controllers;

use App\Models\KlasifikasiJabatan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class KlasifikasiJabatanController extends Controller
{
    /**
     * Display a listing of klasifikasi jabatan.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = KlasifikasiJabatan::query();

            // Filter by kategori_anjab
            if ($request->has('kategori_anjab')) {
                $query->where('kategori_anjab', $request->kategori_anjab);
            }

            // Filter by klasifikasi_utama
            if ($request->has('klasifikasi_utama')) {
                $query->where('klasifikasi_utama', $request->klasifikasi_utama);
            }

            // Filter by subklasifikasi
            if ($request->has('subklasifikasi')) {
                $query->where('subklasifikasi', $request->subklasifikasi);
            }

            // Filter by perangkat_daerah
            if ($request->has('perangkat_daerah')) {
                $query->where('perangkat_daerah', 'like', '%' . $request->perangkat_daerah . '%');
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('jabatan', 'like', '%' . $search . '%')
                        ->orWhere('unit_kerja', 'like', '%' . $search . '%')
                        ->orWhere('perangkat_daerah', 'like', '%' . $search . '%');
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'no_urut');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $data = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Data klasifikasi jabatan berhasil diambil',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for dashboard.
     *
     * @return JsonResponse
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                // Total data
                'total' => KlasifikasiJabatan::count(),
                
                // By kategori anjab
                'by_kategori' => KlasifikasiJabatan::selectRaw('kategori_anjab, COUNT(*) as total')
                    ->groupBy('kategori_anjab')
                    ->get(),
                
                // By klasifikasi utama
                'by_klasifikasi' => KlasifikasiJabatan::selectRaw('klasifikasi_utama, COUNT(*) as total')
                    ->groupBy('klasifikasi_utama')
                    ->get(),
                
                // By subklasifikasi
                'by_subklasifikasi' => KlasifikasiJabatan::selectRaw('subklasifikasi, COUNT(*) as total')
                    ->groupBy('subklasifikasi')
                    ->get(),
                
                // Total bezetting, kebutuhan, selisih
                'summary' => KlasifikasiJabatan::selectRaw('
                    SUM(bezetting) as total_bezetting,
                    SUM(kebutuhan) as total_kebutuhan,
                    SUM(selisih) as total_selisih
                ')->first(),
                
                // Top 10 perangkat daerah by kebutuhan
                'top_perangkat_daerah' => KlasifikasiJabatan::selectRaw('
                    perangkat_daerah,
                    SUM(bezetting) as total_bezetting,
                    SUM(kebutuhan) as total_kebutuhan,
                    SUM(selisih) as total_selisih
                ')
                    ->groupBy('perangkat_daerah')
                    ->orderByRaw('SUM(kebutuhan) DESC')
                    ->limit(10)
                    ->get(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Statistik berhasil diambil',
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified klasifikasi jabatan.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $data = KlasifikasiJabatan::findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diambil',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan'
            ], 404);
        }
    }
}
