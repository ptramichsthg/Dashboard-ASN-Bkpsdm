<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrackingController extends Controller
{
    /**
     * Daftar bulan dalam bahasa Indonesia
     */
    const BULAN_LIST = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];

    const BULAN_MAP = [
        'Januari'   => 1,  'Februari'  => 2,  'Maret'     => 3,
        'April'     => 4,  'Mei'       => 5,  'Juni'      => 6,
        'Juli'      => 7,  'Agustus'   => 8,  'September' => 9,
        'Oktober'   => 10, 'November'  => 11, 'Desember'  => 12,
    ];

    /**
     * Ambil semua data tracking pengajuan layanan ASN.
     *
     * Query params:
     *   - jenis_layanan : filter jenis layanan (default 'Semua')
     *   - tahun         : filter tahun (default tahun sekarang)
     *   - bulan         : filter bulan Indonesia (default 'Semua')
     *   - satker        : filter perangkat daerah (default 'Semua')
     *   - search        : pencarian nama / NIP / nomorSurat
     */
    public function index(Request $request)
    {
        $jenisLayanan = $request->query('jenis_layanan', 'Semua');
        $tahun        = $request->query('tahun', (string) date('Y'));
        $bulan        = $request->query('bulan', 'Semua');
        $satker       = $request->query('satker', 'Semua');
        $search       = $request->query('search', '');

        $query = DB::table('layanans');

        // Filter tahun
        if ($tahun && $tahun !== 'Semua') {
            $query->whereYear('tanggalPengajuan', $tahun);
        }

        // Filter bulan
        if ($bulan && $bulan !== 'Semua' && isset(self::BULAN_MAP[$bulan])) {
            $query->whereMonth('tanggalPengajuan', self::BULAN_MAP[$bulan]);
        }

        // Filter satuan kerja / perangkat daerah
        if ($satker && $satker !== 'Semua') {
            $query->where('perangkatDaerah', $satker);
        }

        // Filter jenis layanan
        if ($jenisLayanan && $jenisLayanan !== 'Semua') {
            $query->where('layanan', $jenisLayanan);
        }

        // Pencarian
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%")
                  ->orWhere('nomorSurat', 'like', "%{$search}%");
            });
        }

        $rawData = $query->orderBy('tanggalPengajuan', 'desc')->get();

        // Hitung KPI ringkasan
        $total   = $rawData->count();
        $usulan  = $rawData->where('status', 'Usulan')->count();
        $proses  = $rawData->where('status', 'Proses')->count();
        $selesai = $rawData->where('status', 'Selesai')->count();

        // Sebaran per jenis layanan untuk chart
        $perLayanan = $rawData
            ->groupBy('layanan')
            ->map(function ($group, $jenis) {
                return [
                    'jenis'   => $jenis,
                    'usulan'  => $group->where('status', 'Usulan')->count(),
                    'proses'  => $group->where('status', 'Proses')->count(),
                    'selesai' => $group->where('status', 'Selesai')->count(),
                    'total'   => $group->count(),
                ];
            })
            ->sortByDesc('total')
            ->values();

        // Daftar satker unik untuk filter
        $satkerList = DB::table('layanans')
            ->distinct()
            ->orderBy('perangkatDaerah')
            ->pluck('perangkatDaerah')
            ->values();

        // Daftar jenis layanan unik untuk filter
        $jenisList = DB::table('layanans')
            ->distinct()
            ->orderBy('layanan')
            ->pluck('layanan')
            ->values();

        // Daftar tahun unik untuk filter
        $tahunList = DB::table('layanans')
            ->selectRaw('YEAR(tanggalPengajuan) as tahun')
            ->distinct()
            ->orderBy('tahun', 'desc')
            ->pluck('tahun')
            ->filter()
            ->values();

        return response()->json([
            'ringkasan' => [
                'total'   => $total,
                'usulan'  => $usulan,
                'proses'  => $proses,
                'selesai' => $selesai,
            ],
            'data'         => $rawData->values(),
            'per_layanan'  => $perLayanan,
            'satker_list'  => $satkerList,
            'jenis_list'   => $jenisList,
            'bulan_list'   => self::BULAN_LIST,
            'tahun_list'   => $tahunList,
            'filter'       => [
                'jenis_layanan' => $jenisLayanan,
                'tahun'         => $tahun,
                'bulan'         => $bulan,
                'satker'        => $satker,
            ],
        ]);
    }

    /**
     * Detail satu pengajuan layanan berdasarkan ID.
     */
    public function show($id)
    {
        $item = DB::table('layanans')->where('id', $id)->first();

        if (! $item) {
            return response()->json(['message' => 'Data tidak ditemukan.'], 404);
        }

        // Ambil riwayat layanan lain milik ASN yang sama (NIP)
        $riwayat = DB::table('layanans')
            ->where('nip', $item->nip)
            ->where('id', '!=', $id)
            ->orderBy('tanggalPengajuan', 'desc')
            ->get();

        return response()->json([
            'data'    => $item,
            'riwayat' => $riwayat,
        ]);
    }
}
