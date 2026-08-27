<?php

namespace App\Http\Controllers;

use App\Models\Perencanaan;
use Illuminate\Http\Request;

class PerencanaanController extends Controller
{
    /** Jumlah item per halaman untuk paginasi server-side (jika dibutuhkan) */
    private const PAGE_SIZE = 10;

    /**
     * Mengambil daftar jabatan kosong/kurang beserta ringkasan KPI dan data grafik.
     *
     * Query params (opsional):
     *   - opd    : filter berdasarkan nama OPD (default: 'Semua')
     *   - search : kata kunci pencarian jabatan atau OPD
     *   - tahun  : filter tahun (default: '2026')
     */
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $opdFilter = $request->query('opd', 'Semua');
        $search    = $request->query('search', '');
        $tahun     = $request->query('tahun', '2026');

        // ── Query utama menggunakan Eloquent ──────────────────────────────────
        $query = Perencanaan::query();

        if ($opdFilter && $opdFilter !== 'Semua') {
            $query->where('opd', $opdFilter);
        }

        if ($search) {
            $keyword = "%{$search}%";
            $query->where(function ($q) use ($keyword) {
                $q->where('jabatan', 'like', $keyword)
                  ->orWhere('opd', 'like', $keyword);
            });
        }

        $filteredData = $query->get();

        // ── Ringkasan KPI ─────────────────────────────────────────────────────
        $ringkasan = $this->buildRingkasan($filteredData, $tahun);

        // ── Sebaran per OPD (untuk grafik bar) ───────────────────────────────
        $perOpd = $filteredData
            ->groupBy('opd')
            ->map(fn($group, $opdName) => [
                'satuan_kerja'        => $opdName,
                'jumlah_jabatan_kosong' => $group->count(),
                'total_kebutuhan'     => $group->sum('kebutuhan'),
            ])
            ->values()
            ->sortByDesc('total_kebutuhan')
            ->values();

        // ── Daftar OPD unik untuk dropdown filter ─────────────────────────────
        $opdList = Perencanaan::query()
            ->distinct()
            ->orderBy('opd')
            ->pluck('opd');

        return response()->json([
            'ringkasan' => $ringkasan,
            'per_opd'   => $perOpd,
            'data'      => $filteredData->values(),
            'opd_list'  => $opdList,
        ]);
    }

    /**
     * Menghitung ringkasan KPI dari koleksi data perencanaan.
     *
     * @param  \Illuminate\Support\Collection  $data
     * @param  string                          $tahun
     * @return array
     */
    private function buildRingkasan($data, string $tahun): array
    {
        // Proyeksi pensiun per tahun (data bisa dipindah ke tabel sendiri di masa depan)
        $proyeksiPensiun = [
            '2024' => 150,
            '2025' => 180,
            '2026' => 210,
            '2027' => 135,
        ];

        $totalJabatanKosong    = $data->count();
        $totalKebutuhanPegawai = $data->sum('kebutuhan');

        return [
            'total_jabatan_kosong'   => $totalJabatanKosong,
            'proyeksi_pensiun'       => $proyeksiPensiun[$tahun] ?? 0,
            'total_kebutuhan_pegawai' => $totalKebutuhanPegawai,
            'formasi_disetujui'      => (int) ($totalKebutuhanPegawai * 0.8),
        ];
    }
}
