<?php

namespace App\Http\Controllers;

use App\Models\DataPegawaiAktif;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

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

            // Filter status pegawai (PNS, PPPK, PPPK PW, CPNS)
            if ($request->filled('status_pegawai') && $request->status_pegawai !== 'Semua') {
                $query->where('status_pegawai', $request->status_pegawai);
            }

            // Filter jenis kelamin (LAKI-LAKI, PEREMPUAN)
            if ($request->filled('jenis_kelamin') && $request->jenis_kelamin !== 'Semua') {
                $query->where('jenis_kelamin', $request->jenis_kelamin);
            }

            // Filter generasi (Gen Z, Millennials (Gen Y), Gen X, Baby Boomers)
            if ($request->filled('generasi') && $request->generasi !== 'Semua') {
                $query->where('generasi', $request->generasi);
            }

            // Filter rentang usia
            if ($request->filled('rentang_usia') && $request->rentang_usia !== 'Semua') {
                $rentang = $request->rentang_usia;
                if ($rentang === '< 30' || $rentang === '< 30 Tahun') {
                    $query->where('usia', '<', 30);
                } elseif ($rentang === '30 - 39' || $rentang === '30 - 39 Tahun') {
                    $query->whereBetween('usia', [30, 39]);
                } elseif ($rentang === '40 - 49' || $rentang === '40 - 49 Tahun') {
                    $query->whereBetween('usia', [40, 49]);
                } elseif ($rentang === '50+' || $rentang === '50+ Tahun') {
                    $query->where('usia', '>=', 50);
                }
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

            // Filter pendidikan (keyword cerdas, misal S-1, S-2, SMP, SD, dll.)
            if ($request->filled('pendidikan') && $request->pendidikan !== 'Semua') {
                $this->applyPendidikanFilter($query, $request->pendidikan);
            }

            // Pencarian global (NIP, Nama Lengkap, Jabatan Utama, Unit Kerja, Satker, Status Pegawai, Generasi, Jenis Kelamin, Usia)
            if ($request->filled('search')) {
                $search = trim($request->search);
                $query->where(function ($q) use ($search) {
                    $q->where('nip', 'like', '%' . $search . '%')
                      ->orWhere('nama_lengkap', 'like', '%' . $search . '%')
                      ->orWhere('jabatan_utama', 'like', '%' . $search . '%')
                      ->orWhere('unit_kerja', 'like', '%' . $search . '%')
                      ->orWhere('satuan_kerja', 'like', '%' . $search . '%')
                      ->orWhere('status_pegawai', 'like', '%' . $search . '%')
                      ->orWhere('generasi', 'like', '%' . $search . '%')
                      ->orWhere('jenis_kelamin', 'like', '%' . $search . '%')
                      ->orWhere('usia', 'like', '%' . $search . '%');
                });
            }

            // Sorting
            $sortBy = $request->input('sort_by', 'nama_lengkap');
            $sortOrder = strtolower($request->input('sort_order', 'asc')) === 'desc' ? 'desc' : 'asc';
            
            $allowedSorts = ['id', 'nip', 'nama_lengkap', 'status_pegawai', 'golongan_akhir', 'pendidikan', 'eselon', 'jabatan_utama', 'unit_kerja', 'satuan_kerja', 'usia', 'generasi', 'jenis_kelamin'];
            if (!in_array($sortBy, $allowedSorts)) {
                $sortBy = 'nama_lengkap';
            }

            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = (int) $request->input('per_page', 15);
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
     * Mengambil statistik ringkasan data pegawai (Tingkat Pendidikan, Golongan, Eselon, Satker, Status Pegawai, Usia, Generasi, Gender).
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $cacheKey = 'pegawai_stats_v8_' . md5(json_encode($request->all()));

            $data = Cache::remember($cacheKey, 600, function () use ($request) {
                // Global status counts (hanya difilter berdasarkan satuan_kerja bila ada, untuk badge Tab Cepat)
                $tabQuery = DataPegawaiAktif::query();
                if ($request->filled('satuan_kerja') && $request->satuan_kerja !== 'Semua') {
                    $tabQuery->where('satuan_kerja', $request->satuan_kerja);
                }
                $tabCounts = [
                    'total' => (clone $tabQuery)->count(),
                    'pns' => (clone $tabQuery)->where('status_pegawai', 'PNS')->count(),
                    'pppk' => (clone $tabQuery)->where('status_pegawai', 'PPPK')->count(),
                    'pppk_pw' => (clone $tabQuery)->where('status_pegawai', 'PPPK PW')->count(),
                    'cpns' => (clone $tabQuery)->where('status_pegawai', 'CPNS')->count(),
                ];

                // Query utama dengan seluruh filter aktif
                $baseQuery = DataPegawaiAktif::query();

                if ($request->filled('satuan_kerja') && $request->satuan_kerja !== 'Semua') {
                    $baseQuery->where('satuan_kerja', $request->satuan_kerja);
                }

                if ($request->filled('status_pegawai') && $request->status_pegawai !== 'Semua') {
                    $baseQuery->where('status_pegawai', $request->status_pegawai);
                }

                if ($request->filled('jenis_kelamin') && $request->jenis_kelamin !== 'Semua') {
                    $baseQuery->where('jenis_kelamin', $request->jenis_kelamin);
                }

                if ($request->filled('generasi') && $request->generasi !== 'Semua') {
                    $baseQuery->where('generasi', $request->generasi);
                }

                if ($request->filled('rentang_usia') && $request->rentang_usia !== 'Semua') {
                    $rentang = $request->rentang_usia;
                    if ($rentang === '< 30' || $rentang === '< 30 Tahun') {
                        $baseQuery->where('usia', '<', 30);
                    } elseif ($rentang === '30 - 39' || $rentang === '30 - 39 Tahun') {
                        $baseQuery->whereBetween('usia', [30, 39]);
                    } elseif ($rentang === '40 - 49' || $rentang === '40 - 49 Tahun') {
                        $baseQuery->whereBetween('usia', [40, 49]);
                    } elseif ($rentang === '50+' || $rentang === '50+ Tahun') {
                        $baseQuery->where('usia', '>=', 50);
                    }
                }

                if ($request->filled('golongan_akhir') && $request->golongan_akhir !== 'Semua') {
                    $baseQuery->where('golongan_akhir', $request->golongan_akhir);
                }

                if ($request->filled('eselon') && $request->eselon !== 'Semua') {
                    if ($request->eselon === 'Non-Eselon') {
                        $baseQuery->where(function ($q) {
                            $q->whereNull('eselon')->orWhere('eselon', '')->orWhere('eselon', '-');
                        });
                    } else {
                        $baseQuery->where('eselon', $request->eselon);
                    }
                }

                if ($request->filled('pendidikan') && $request->pendidikan !== 'Semua') {
                    $this->applyPendidikanFilter($baseQuery, $request->pendidikan);
                }

                if ($request->filled('search')) {
                    $search = trim($request->search);
                    $baseQuery->where(function ($q) use ($search) {
                        $q->where('nip', 'like', '%' . $search . '%')
                          ->orWhere('nama_lengkap', 'like', '%' . $search . '%')
                          ->orWhere('jabatan_utama', 'like', '%' . $search . '%')
                          ->orWhere('unit_kerja', 'like', '%' . $search . '%')
                          ->orWhere('satuan_kerja', 'like', '%' . $search . '%')
                          ->orWhere('status_pegawai', 'like', '%' . $search . '%')
                          ->orWhere('generasi', 'like', '%' . $search . '%')
                          ->orWhere('jenis_kelamin', 'like', '%' . $search . '%')
                          ->orWhere('usia', 'like', '%' . $search . '%');
                    });
                }

                $total = (clone $baseQuery)->count();

                // Ringkasan Status Pegawai Terfilter
                $statusPegawaiChart = (clone $baseQuery)
                    ->whereNotNull('status_pegawai')
                    ->where('status_pegawai', '!=', '')
                    ->select('status_pegawai as name', DB::raw('count(*) as value'))
                    ->groupBy('status_pegawai')
                    ->orderByDesc('value')
                    ->get()
                    ->toArray();

                $statusCounts = [
                    'pns' => (clone $baseQuery)->where('status_pegawai', 'PNS')->count(),
                    'pppk' => (clone $baseQuery)->where('status_pegawai', 'PPPK')->count(),
                    'pppk_pw' => (clone $baseQuery)->where('status_pegawai', 'PPPK PW')->count(),
                    'cpns' => (clone $baseQuery)->where('status_pegawai', 'CPNS')->count(),
                ];

                // Rata-rata Usia
                $avgUsia = round((float) ((clone $baseQuery)->whereNotNull('usia')->avg('usia') ?? 0), 1);

                // Sebaran Generasi
                $generasiChart = (clone $baseQuery)
                    ->whereNotNull('generasi')
                    ->where('generasi', '!=', '')
                    ->select('generasi as name', DB::raw('count(*) as value'))
                    ->groupBy('generasi')
                    ->orderByDesc('value')
                    ->get()
                    ->toArray();

                // Sebaran Jenis Kelamin
                $genderChart = (clone $baseQuery)
                    ->whereNotNull('jenis_kelamin')
                    ->where('jenis_kelamin', '!=', '')
                    ->select('jenis_kelamin as name', DB::raw('count(*) as value'))
                    ->groupBy('jenis_kelamin')
                    ->orderByDesc('value')
                    ->get()
                    ->toArray();

                // Kelompok Usia
                $usiaUnder30 = (clone $baseQuery)->where('usia', '<', 30)->count();
                $usia30_39 = (clone $baseQuery)->whereBetween('usia', [30, 39])->count();
                $usia40_49 = (clone $baseQuery)->whereBetween('usia', [40, 49])->count();
                $usia50Plus = (clone $baseQuery)->where('usia', '>=', 50)->count();

                $kelompokUsiaChart = [
                    ['name' => '< 30 Tahun', 'value' => $usiaUnder30],
                    ['name' => '30 - 39 Tahun', 'value' => $usia30_39],
                    ['name' => '40 - 49 Tahun', 'value' => $usia40_49],
                    ['name' => '50+ Tahun', 'value' => $usia50Plus],
                ];

                // Ringkasan Jenjang Pendidikan
                $jenjangCounts = [
                    'S3 (Doktor)' => 0,
                    'S2 (Magister)' => 0,
                    'S1 / D-IV' => 0,
                    'D-III / D3' => 0,
                    'SMA / SMK' => 0,
                    'SMP / SLTP' => 0,
                    'SD / Sederajat' => 0,
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
                    } elseif (str_contains($text, 'S-1') || str_contains($text, 'S1') || str_contains($text, 'SARJANA') || str_contains($text, 'D-IV') || str_contains($text, 'DIV') || str_contains($text, 'PROFESI')) {
                        $jenjangCounts['S1 / D-IV'] += $count;
                    } elseif (str_contains($text, 'D-III') || str_contains($text, 'D3') || str_contains($text, 'DIPLOMA') || str_contains($text, 'D-I') || str_contains($text, 'D-II')) {
                        $jenjangCounts['D-III / D3'] += $count;
                    } elseif (str_contains($text, 'SLTA') || str_contains($text, 'SMA') || str_contains($text, 'SMK') || str_contains($text, 'ALIYAH')) {
                        $jenjangCounts['SMA / SMK'] += $count;
                    } elseif (str_contains($text, 'SLTP') || str_contains($text, 'SMP') || str_contains($text, 'MTS')) {
                        $jenjangCounts['SMP / SLTP'] += $count;
                    } elseif (str_contains($text, 'SD') || str_contains($text, 'SEKOLAH DASAR')) {
                        $jenjangCounts['SD / Sederajat'] += $count;
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

                // Sebaran Golongan
                $golonganChart = (clone $baseQuery)
                    ->whereNotNull('golongan_akhir')
                    ->where('golongan_akhir', '!=', '')
                    ->select('golongan_akhir as name', DB::raw('count(*) as value'))
                    ->groupBy('golongan_akhir')
                    ->orderByDesc('value')
                    ->limit(10)
                    ->get()
                    ->toArray();

                // Sebaran Eselon
                $eselonChart = (clone $baseQuery)
                    ->whereNotNull('eselon')
                    ->where('eselon', '!=', '')
                    ->where('eselon', '!=', '-')
                    ->select('eselon as name', DB::raw('count(*) as value'))
                    ->groupBy('eselon')
                    ->orderByDesc('value')
                    ->get()
                    ->toArray();

                // Sebaran Eselon Terkelompok
                $eselonII = (clone $baseQuery)->where(function($q) { $q->where('eselon', 'like', 'II%'); })->count();
                $eselonIII = (clone $baseQuery)->where(function($q) { $q->where('eselon', 'like', 'III%'); })->count();
                $eselonIV = (clone $baseQuery)->where(function($q) { $q->where('eselon', 'like', 'IV%'); })->count();
                $nonEselon = (clone $baseQuery)->where(function($q) {
                    $q->whereNull('eselon')->orWhere('eselon', '')->orWhere('eselon', '-');
                })->count();

                $eselonGrouped = [
                    ['name' => 'Eselon II (JPT Pratama)', 'value' => $eselonII],
                    ['name' => 'Eselon III (Administrator)', 'value' => $eselonIII],
                    ['name' => 'Eselon IV (Pengawas)', 'value' => $eselonIV],
                    ['name' => 'Non-Eselon (Fungsional / Pelaksana)', 'value' => $nonEselon],
                ];

                // Sebaran Golongan Terkelompok
                $golIV = (clone $baseQuery)->where('golongan_akhir', 'like', 'IV/%')->count();
                $golIII = (clone $baseQuery)->where('golongan_akhir', 'like', 'III/%')->count();
                $golII = (clone $baseQuery)->where('golongan_akhir', 'like', 'II/%')->count();
                $golI = (clone $baseQuery)->where('golongan_akhir', 'like', 'I/%')->count();
                $golPppk = (clone $baseQuery)->where('status_pegawai', 'PPPK')->whereNotNull('golongan_akhir')->where('golongan_akhir', 'not like', '%/%')->count();
                $nonGol = (clone $baseQuery)->where(function($q) {
                    $q->whereNull('golongan_akhir')->orWhere('golongan_akhir', '')->orWhere('golongan_akhir', '-');
                })->count();

                $golonganGrouped = [
                    ['name' => 'Golongan IV', 'value' => $golIV],
                    ['name' => 'Golongan III', 'value' => $golIII],
                    ['name' => 'Golongan II', 'value' => $golII],
                    ['name' => 'Golongan I', 'value' => $golI],
                    ['name' => 'Golongan PPPK (V s/d XI)', 'value' => $golPppk],
                    ['name' => 'Non-Golongan (PPPK Paruh Waktu)', 'value' => $nonGol],
                ];

                // Sebaran Satuan Kerja
                $satkerChart = (clone $baseQuery)
                    ->whereNotNull('satuan_kerja')
                    ->where('satuan_kerja', '!=', '')
                    ->select('satuan_kerja as name', DB::raw('count(*) as value'))
                    ->groupBy('satuan_kerja')
                    ->orderByDesc('value')
                    ->limit(8)
                    ->get()
                    ->toArray();

                return [
                    'total_pegawai' => $total,
                    'status_counts' => $statusCounts,
                    'tab_counts' => $tabCounts,
                    'rata_rata_usia' => $avgUsia,
                    'sebaran_status_pegawai' => $statusPegawaiChart,
                    'sebaran_generasi' => $generasiChart,
                    'sebaran_jenis_kelamin' => $genderChart,
                    'sebaran_kelompok_usia' => $kelompokUsiaChart,
                    'jenjang_pendidikan' => $pendidikanChart,
                    'sebaran_pendidikan' => $pendidikanChart,
                    'sebaran_golongan' => $golonganChart,
                    'sebaran_golongan_grouped' => $golonganGrouped,
                    'sebaran_eselon' => $eselonChart,
                    'sebaran_eselon_grouped' => $eselonGrouped,
                    'sebaran_satker' => $satkerChart,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
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

            $statusPegawaiList = DataPegawaiAktif::whereNotNull('status_pegawai')
                ->where('status_pegawai', '!=', '')
                ->distinct()
                ->pluck('status_pegawai')
                ->sort()
                ->values();

            $jenisKelaminList = DataPegawaiAktif::whereNotNull('jenis_kelamin')
                ->where('jenis_kelamin', '!=', '')
                ->distinct()
                ->pluck('jenis_kelamin')
                ->sort()
                ->values();

            $generasiList = ['Gen Z', 'Millennials (Gen Y)', 'Gen X', 'Baby Boomers'];

            $rentangUsiaList = ['< 30 Tahun', '30 - 39 Tahun', '40 - 49 Tahun', '50+ Tahun'];

            return response()->json([
                'success' => true,
                'data' => [
                    'satuan_kerja' => $satkerList,
                    'golongan' => $golonganList,
                    'eselon' => $eselonList,
                    'status_pegawai' => $statusPegawaiList,
                    'jenis_kelamin' => $jenisKelaminList,
                    'generasi' => $generasiList,
                    'rentang_usia' => $rentangUsiaList,
                    'jenjang_pendidikan' => ['S3', 'S2', 'S1', 'D-IV', 'D-III', 'SMA', 'SMK', 'SMP', 'SD'],
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
            $jabatan = trim($request->input('jabatan', ''));
            $unitKerja = trim($request->input('unit_kerja', ''));
            $satker = trim($request->input('satuan_kerja', ''));

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

    /**
     * Helper untuk filter pendidikan fleksibel (mencakup singkatan jenjang dan padanan kata).
     */
    private function applyPendidikanFilter($query, string $pend): void
    {
        $pendUpper = strtoupper(trim($pend));
        if ($pendUpper === 'SD') {
            $query->where(function ($q) {
                $q->where('pendidikan', 'like', 'SD%')
                  ->orWhere('pendidikan', 'like', 'SEKOLAH DASAR%');
            })
            ->where('pendidikan', 'not like', '%SARJANA%')
            ->where('pendidikan', 'not like', '%S-1%')
            ->where('pendidikan', 'not like', '%S-2%')
            ->where('pendidikan', 'not like', '%DIPLOMA%')
            ->where('pendidikan', 'not like', '%SLTA%');
        } elseif ($pendUpper === 'SMP' || $pendUpper === 'SLTP') {
            $query->where(function ($q) {
                $q->where('pendidikan', 'like', '%SMP%')
                  ->orWhere('pendidikan', 'like', '%SLTP%')
                  ->orWhere('pendidikan', 'like', '%MTS%');
            });
        } elseif ($pendUpper === 'SMA' || $pendUpper === 'SMK' || $pendUpper === 'SLTA') {
            $query->where(function ($q) {
                $q->where('pendidikan', 'like', '%SMA%')
                  ->orWhere('pendidikan', 'like', '%SMK%')
                  ->orWhere('pendidikan', 'like', '%SLTA%')
                  ->orWhere('pendidikan', 'like', '%ALIYAH%');
            });
        } elseif ($pendUpper === 'S1' || $pendUpper === 'S-1' || $pendUpper === 'D-IV') {
            $query->where(function ($q) {
                $q->where('pendidikan', 'like', '%S-1%')
                  ->orWhere('pendidikan', 'like', '%S1%')
                  ->orWhere('pendidikan', 'like', '%D-IV%')
                  ->orWhere('pendidikan', 'like', '%DIV%')
                  ->orWhere('pendidikan', 'like', '%SARJANA%')
                  ->orWhere('pendidikan', 'like', '%PROFESI%');
            });
        } elseif ($pendUpper === 'S2' || $pendUpper === 'S-2') {
            $query->where(function ($q) {
                $q->where('pendidikan', 'like', '%S-2%')
                  ->orWhere('pendidikan', 'like', '%S2%')
                  ->orWhere('pendidikan', 'like', '%MAGISTER%');
            });
        } elseif ($pendUpper === 'S3' || $pendUpper === 'S-3') {
            $query->where(function ($q) {
                $q->where('pendidikan', 'like', '%S-3%')
                  ->orWhere('pendidikan', 'like', '%S3%')
                  ->orWhere('pendidikan', 'like', '%DOKTOR%');
            });
        } elseif ($pendUpper === 'D-III' || $pendUpper === 'D3') {
            $query->where(function ($q) {
                $q->where('pendidikan', 'like', '%D-III%')
                  ->orWhere('pendidikan', 'like', '%D3%')
                  ->orWhere('pendidikan', 'like', '%DIPLOMA%');
            });
        } else {
            $query->where('pendidikan', 'like', '%' . $pend . '%');
        }
    }
}
