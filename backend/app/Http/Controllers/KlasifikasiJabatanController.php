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

            // Filter by jenis_eselon
            if ($request->has('jenis_eselon')) {
                $query->where('jenis_eselon', $request->jenis_eselon);
            }

            // Filter by perangkat_daerah
            if ($request->has('perangkat_daerah')) {
                $query->where('perangkat_daerah', 'like', '%' . $request->perangkat_daerah . '%');
            }

            // Filter by unit_kerja (or match perangkat_daerah)
            if ($request->has('unit_kerja')) {
                $unit = $request->unit_kerja;
                $query->where(function ($q) use ($unit) {
                    $q->where('unit_kerja', 'like', '%' . $unit . '%')
                        ->orWhere('perangkat_daerah', 'like', '%' . $unit . '%');
                });
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
     * Get aggregated data for MANAJERIAL jabatan only.
     * Returns:
     *  - rekap: bezetting/kebutuhan/selisih per subklasifikasi + eselon
     *  - jabatan_kosong: list of positions where bezetting < kebutuhan
     *
     * @return JsonResponse
     */
    public function manajerial(): JsonResponse
    {
        try {
            // Urutan eselon yang diinginkan
            $eselonOrder = [
                'Eselon II.a' => 1,
                'Eselon II.b' => 2,
                'Eselon III.a' => 3,
                'Eselon III.b' => 4,
                'Eselon IV.a' => 5,
                'Eselon IV.b' => 6,
            ];

            // Rekap per subklasifikasi + eselon
            $rekap = KlasifikasiJabatan::where('klasifikasi_utama', 'MANAJERIAL')
                ->selectRaw('
                    subklasifikasi,
                    jenis_eselon,
                    SUM(bezetting) as total_bezetting,
                    SUM(kebutuhan) as total_kebutuhan,
                    SUM(selisih) as total_selisih,
                    COUNT(*) as total_jabatan
                ')
                ->groupBy('subklasifikasi', 'jenis_eselon')
                ->get()
                ->sortBy(function ($item) use ($eselonOrder) {
                    return $eselonOrder[$item->jenis_eselon] ?? 99;
                })
                ->values();

            // Ringkasan total
            $summary = KlasifikasiJabatan::where('klasifikasi_utama', 'MANAJERIAL')
                ->selectRaw('
                    SUM(bezetting) as total_bezetting,
                    SUM(kebutuhan) as total_kebutuhan,
                    SUM(selisih) as total_selisih,
                    COUNT(CASE WHEN bezetting < kebutuhan THEN 1 END) as total_jabatan_kosong
                ')
                ->first();

            // List jabatan yang kosong/lowong (bezetting < kebutuhan)
            $jabatanKosong = KlasifikasiJabatan::where('klasifikasi_utama', 'MANAJERIAL')
                ->whereRaw('bezetting < kebutuhan')
                ->select(
                    'id',
                    'perangkat_daerah',
                    'jabatan',
                    'unit_kerja',
                    'subklasifikasi',
                    'jenis_eselon',
                    'bezetting',
                    'kebutuhan',
                    'selisih'
                )
                ->orderByRaw('FIELD(jenis_eselon, "Eselon II.a", "Eselon II.b", "Eselon III.a", "Eselon III.b", "Eselon IV.a", "Eselon IV.b")')
                ->orderBy('perangkat_daerah')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Data jabatan manajerial berhasil diambil',
                'data' => [
                    'rekap' => $rekap,
                    'summary' => $summary,
                    'jabatan_kosong' => $jabatanKosong,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data: ' . $e->getMessage()
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
