<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PengembanganKompetensiController extends Controller
{
    const TARGET_JP = 20;

    public function index(Request $request)
    {
        $bulan  = $request->query('bulan', 'Agustus');
        $tahun  = $request->query('tahun', 2026);
        $satker = $request->query('satker', 'Semua');
        $search = $request->query('search', '');

        // Query: agregasi JP per ASN per bulan/tahun
        $query = DB::table('pengembangan_kompetensi')
            ->select('nip', 'nama_asn', 'satuan_kerja', DB::raw('SUM(jp) as total_jp'))
            ->where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->groupBy('nip', 'nama_asn', 'satuan_kerja');

        if ($satker && $satker !== 'Semua') {
            $query->where('satuan_kerja', $satker);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_asn', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
            });
        }

        $rawData = $query->orderBy('total_jp', 'desc')->get();

        $target = self::TARGET_JP;

        $data = $rawData->map(function ($row) use ($target) {
            $totalJp    = (int) $row->total_jp;
            $terpenuhi  = $totalJp >= $target;
            $kekurangan = $terpenuhi ? 0 : ($target - $totalJp);
            $reward     = $totalJp > $target;

            return [
                'nip'          => $row->nip,
                'nama'         => $row->nama_asn,
                'satuan_kerja' => $row->satuan_kerja,
                'total_jp'     => $totalJp,
                'target_jp'    => $target,
                'status'       => $terpenuhi ? 'terpenuhi' : 'kurang',
                'kekurangan'   => $kekurangan,
                'reward'       => $reward,
            ];
        })->values();

        // KPI Ringkasan
        $totalAsn       = $data->count();
        $sudahMemenuhi  = $data->where('status', 'terpenuhi')->count();
        $belumMemenuhi  = $data->where('status', 'kurang')->count();
        $totalJpAll     = $data->sum('total_jp');
        $asnReward      = $data->where('reward', true)->count();

        // Sebaran per OPD (untuk grafik)
        $perOpd = $data->groupBy('satuan_kerja')->map(function ($group, $satker) {
            return [
                'satuan_kerja'   => $satker,
                'sudah_memenuhi' => $group->where('status', 'terpenuhi')->count(),
                'belum_memenuhi' => $group->where('status', 'kurang')->count(),
                'total_asn'      => $group->count(),
            ];
        })->values();

        // Daftar bulan & satker untuk filter
        $bulanList = ['Januari','Februari','Maret','April','Mei','Juni',
                      'Juli','Agustus','September','Oktober','November','Desember'];

        $satkerList = DB::table('pengembangan_kompetensi')
            ->distinct()
            ->pluck('satuan_kerja')
            ->sort()
            ->values();

        return response()->json([
            'ringkasan' => [
                'total_asn'      => $totalAsn,
                'sudah_memenuhi' => $sudahMemenuhi,
                'belum_memenuhi' => $belumMemenuhi,
                'total_jp'       => $totalJpAll,
                'asn_reward'     => $asnReward,
                'target_jp'      => $target,
            ],
            'data'       => $data,
            'per_opd'    => $perOpd,
            'bulan_list' => $bulanList,
            'satker_list'=> $satkerList,
            'filter'     => ['bulan' => $bulan, 'tahun' => $tahun],
        ]);
    }
}
