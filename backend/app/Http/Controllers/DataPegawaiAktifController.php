<?php

namespace App\Http\Controllers;

use App\Models\DataPegawaiAktif;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DataPegawaiAktifController extends Controller
{
    /**
     * Mengambil daftar data pegawai aktif dengan filter, pencarian, dan pagination.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = DataPegawaiAktif::query();

            // Filter satuan kerja
            if ($request->filled('satuan_kerja') && $request->satuan_kerja !== 'Semua') {
                $query->where('satuan_kerja', $request->satuan_kerja);
            }

            // Filter unit kerja
            if ($request->filled('unit_kerja') && $request->unit_kerja !== 'Semua') {
                $query->where('unit_kerja', 'like', '%' . $request->unit_kerja . '%');
            }

            // Filter golongan akhir
            if ($request->filled('golongan_akhir') && $request->golongan_akhir !== 'Semua') {
                $query->where('golongan_akhir', $request->golongan_akhir);
            }

            // Filter eselon
            if ($request->filled('eselon') && $request->eselon !== 'Semua') {
                if ($request->eselon === 'Non-Eselon') {
                    $query->where(function ($q) {
                        $q->whereNull('eselon')->orWhere('eselon', '')->orWhere('eselon', '-');
                    });
                } else {
                    $query->where('eselon', $request->eselon);
                }
            }

            // Filter pendidikan (keyword, misal S-1, S-2, dll.)
            if ($request->filled('pendidikan') && $request->pendidikan !== 'Semua') {
                $query->where('pendidikan', 'like', '%' . $request->pendidikan . '%');
            }

            // Pencarian global (NIP, Nama Lengkap, Jabatan Utama, Unit Kerja)
            if ($request->filled('search')) {
                $search = trim($request->search);
                $query->where(function ($q) use ($search) {
                    $q->where('nip', 'like', '%' . $search . '%')
                      ->orWhere('nama_lengkap', 'like', '%' . $search . '%')
                      ->orWhere('jabatan_utama', 'like', '%' . $search . '%')
                      ->orWhere('unit_kerja', 'like', '%' . $search . '%')
                      ->orWhere('satuan_kerja', 'like', '%' . $search . '%');
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'nama_lengkap');
            $sortOrder = strtolower($request->get('sort_order', 'asc')) === 'desc' ? 'desc' : 'asc';
            
            $allowedSorts = ['id', 'nip', 'nama_lengkap', 'golongan_akhir', 'pendidikan', 'eselon', 'jabatan_utama', 'unit_kerja', 'satuan_kerja'];
            if (!in_array($sortBy, $allowedSorts)) {
                $sortBy = 'nama_lengkap';
            }

            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = (int) $request->get('per_page', 15);
            if ($perPage <= 0 || $perPage > 100) {
                $perPage = 15;
            }

            $result = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pegawai: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mengambil statistik ringkasan data pegawai (Tingkat Pendidikan, Golongan, Eselon, Satker).
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $baseQuery = DataPegawaiAktif::query();

            if ($request->filled('satuan_kerja') && $request->satuan_kerja !== 'Semua') {
                $baseQuery->where('satuan_kerja', $request->satuan_kerja);
            }

            $total = (clone $baseQuery)->count();

            // Ringkasan Jenjang Pendidikan (optimized with SQL)
            $jenjangCounts = [
                'S3 (Doktor)' => 0,
                'S2 (Magister)' => 0,
                'S1 / D-IV' => 0,
                'D-III / D3' => 0,
                'SMA / SMK' => 0,
                'Lainnya' => 0,
            ];

            $pendidikanGroups = (clone $baseQuery)
                ->whereNotNull('pendidikan')
                ->where('pendidikan', '!=', '')
                ->select('pendidikan', DB::raw('count(*) as total'))
                ->groupBy('pendidikan')
                ->get();

            foreach ($pendidikanGroups as $p) {
                $text = strtoupper($p->pendidikan);
                $count = $p->total;
                
                if (str_contains($text, 'S-3') || str_contains($text, 'S3') || str_contains($text, 'DOKTOR')) {
                    $jenjangCounts['S3 (Doktor)'] += $count;
                } elseif (str_contains($text, 'S-2') || str_contains($text, 'S2') || str_contains($text, 'MAGISTER')) {
                    $jenjangCounts['S2 (Magister)'] += $count;
                } elseif (str_contains($text, 'S-1') || str_contains($text, 'S1') || str_contains($text, 'SARJANA') || str_contains($text, 'D-IV') || str_contains($text, 'DIV')) {
                    $jenjangCounts['S1 / D-IV'] += $count;
                } elseif (str_contains($text, 'D-III') || str_contains($text, 'D3') || str_contains($text, 'DIPLOMA')) {
                    $jenjangCounts['D-III / D3'] += $count;
                } elseif (str_contains($text, 'SLTA') || str_contains($text, 'SMA') || str_contains($text, 'SMK') || str_contains($text, 'ALIYAH')) {
                    $jenjangCounts['SMA / SMK'] += $count;
                } else {
                    $jenjangCounts['Lainnya'] += $count;
                }
            }

            $pendidikanChart = [];
            foreach ($jenjangCounts as $name => $count) {
                if ($count > 0) {
                    $pendidikanChart[] = ['name' => $name, 'value' => $count];
                }
            }

            // Sebaran Golongan (Top 10)
            $golonganChart = (clone $baseQuery)
                ->whereNotNull('golongan_akhir')
                ->where('golongan_akhir', '!=', '')
                ->select('golongan_akhir as name', DB::raw('count(*) as value'))
                ->groupBy('golongan_akhir')
                ->orderByDesc('value')
                ->limit(10)
                ->get();

            // Sebaran Eselon
            $eselonChart = (clone $baseQuery)
                ->whereNotNull('eselon')
                ->where('eselon', '!=', '')
                ->where('eselon', '!=', '-')
                ->select('eselon as name', DB::raw('count(*) as value'))
                ->groupBy('eselon')
                ->orderByDesc('value')
                ->get();

            // Sebaran Satuan Kerja (Top 8)
            $satkerChart = (clone $baseQuery)
                ->whereNotNull('satuan_kerja')
                ->where('satuan_kerja', '!=', '')
                ->select('satuan_kerja as name', DB::raw('count(*) as value'))
                ->groupBy('satuan_kerja')
                ->orderByDesc('value')
                ->limit(8)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_pegawai' => $total,
                    'jenjang_pendidikan' => $pendidikanChart,
                    'sebaran_golongan' => $golonganChart,
                    'sebaran_eselon' => $eselonChart,
                    'sebaran_satker' => $satkerChart,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Opsi filter dinamis untuk dropdown di Frontend.
     */
    public function filterOptions(): JsonResponse
    {
        try {
            $satkerList = DataPegawaiAktif::whereNotNull('satuan_kerja')
                ->where('satuan_kerja', '!=', '')
                ->distinct()
                ->pluck('satuan_kerja')
                ->sort()
                ->values();

            $golonganList = DataPegawaiAktif::whereNotNull('golongan_akhir')
                ->where('golongan_akhir', '!=', '')
                ->distinct()
                ->pluck('golongan_akhir')
                ->sort()
                ->values();

            $eselonList = DataPegawaiAktif::whereNotNull('eselon')
                ->where('eselon', '!=', '')
                ->where('eselon', '!=', '-')
                ->distinct()
                ->pluck('eselon')
                ->sort()
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'satuan_kerja' => $satkerList,
                    'golongan' => $golonganList,
                    'eselon' => $eselonList,
                    'jenjang_pendidikan' => ['S3', 'S2', 'S1', 'D-IV', 'D-III', 'SMA', 'SMK'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil opsi filter: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mencari pemegang jabatan tertentu untuk modal drilldown di Profil/Dashboard.
     */
    public function byJabatan(Request $request): JsonResponse
    {
        try {
            $jabatan = trim($request->get('jabatan', ''));
            $unitKerja = trim($request->get('unit_kerja', ''));
            $satker = trim($request->get('satuan_kerja', ''));

            if (empty($jabatan) && empty($unitKerja)) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                ]);
            }

            $query = DataPegawaiAktif::query();

            if (!empty($jabatan)) {
                $query->where('jabatan_utama', 'like', '%' . $jabatan . '%');
            }

            if (!empty($unitKerja)) {
                $query->where(function ($q) use ($unitKerja) {
                    $q->where('unit_kerja', 'like', '%' . $unitKerja . '%')
                      ->orWhere('satuan_kerja', 'like', '%' . $unitKerja . '%');
                });
            }

            if (!empty($satker) && $satker !== 'Semua Satuan Kerja') {
                $query->where('satuan_kerja', 'like', '%' . $satker . '%');
            }

            $pegawai = $query->limit(20)->get();

            return response()->json([
                'success' => true,
                'data' => $pegawai,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencari pemegang jabatan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
