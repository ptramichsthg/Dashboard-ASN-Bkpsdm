<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Endpoint untuk halaman Profil ASN.
     * Mengembalikan data Jenis ASN: CPNS, PNS, PPPK, PPPK PW (pppk_p)
     * dari tabel satuan_kerja (bisa difilter per satker).
     */
    public function profil(Request $request)
    {
        $satker = $request->query('satker', 'Semua Satuan Kerja');

        // Untuk filter semua satker, gunakan tabel status_pegawai (lebih akurat)
        // Untuk filter per satker, fallback ke satuan_kerja
        if ($satker === 'Semua Satuan Kerja') {
            $spQuery = DB::table('status_pegawai')
                ->selectRaw('status_pegawai, jumlah')
                ->pluck('jumlah', 'status_pegawai');

            $cpns = (int) ($spQuery['CPNS'] ?? 0);
            $pns  = (int) ($spQuery['PNS']  ?? 0);

            // PPPK split: ambil pppk_l (full-time) dan pppk_p (PW) dari satuan_kerja
            $pppkRow = DB::table('satuan_kerja')
                ->selectRaw('SUM(pppk_l) as pppk_l, SUM(pppk_p) as pppk_p, SUM(total) as total_asn')
                ->first();

            $pppk   = (int) $pppkRow->pppk_l;
            $pppkPw = (int) $pppkRow->pppk_p;
            $total  = $cpns + $pns + $pppk + $pppkPw;
        } else {
            $row = DB::table('satuan_kerja')
                ->where('satuan_kerja', $satker)
                ->selectRaw('SUM(cpns_l) as cpns_l, SUM(cpns_p) as cpns_p, SUM(pns_l) as pns_l, SUM(pns_p) as pns_p, SUM(pppk_l) as pppk_l, SUM(pppk_p) as pppk_p, SUM(total) as total_asn')
                ->first();

            $cpns   = (int) $row->cpns_l + (int) $row->cpns_p;
            $pns    = (int) $row->pns_l  + (int) $row->pns_p;
            $pppk   = (int) $row->pppk_l;
            $pppkPw = (int) $row->pppk_p;
            $total  = (int) $row->total_asn;
        }

        $satuanKerjaList = DB::table('satuan_kerja')->pluck('satuan_kerja')->toArray();

        return response()->json([
            'jenis_asn' => [
                ['label' => 'CPNS',    'value' => $cpns,   'icon' => 'cpns'],
                ['label' => 'PNS',     'value' => $pns,    'icon' => 'pns'],
                ['label' => 'PPPK',    'value' => $pppk,   'icon' => 'pppk'],
                ['label' => 'PPPK PW', 'value' => $pppkPw, 'icon' => 'pppkpw'],
            ],
            'total_asn' => $total,
            'satuan_kerja_list' => $satuanKerjaList,
        ]);
    }

    public function index(Request $request)
    {

        $satker = $request->query('satker', 'Semua Satuan Kerja');
        $tahunReq = $request->query('tahun');
        $bulanReq = $request->query('bulan');

        // Get snapshot date from overview table to validate tahun/bulan
        $overview = DB::table('overview')->first();
        $tahunList = ['Semua'];
        $bulanList = ['Semua'];
        
        $dataTahun = 'Semua';
        $dataBulan = 'Semua';

        if ($overview && $overview->tanggal_data) {
            $timestamp = strtotime($overview->tanggal_data);
            $year = date('Y', $timestamp);
            $month = date('n', $timestamp);
            
            $bulanIndo = [
                1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 
                5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus', 
                9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
            ];
            
            $dataTahun = (string)$year;
            $dataBulan = $bulanIndo[$month];
            
            $tahunList = ['Semua', '2024', '2025', '2026', '2027']; 
            $bulanList = ['Semua', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        }

        $satuanKerjaList = DB::table('satuan_kerja')->pluck('satuan_kerja')->toArray();

        // If the requested tahun/bulan does not match the only snapshot we have, return empty data
        if (($tahunReq && $tahunReq !== 'Semua' && $tahunReq !== $dataTahun) || 
            ($bulanReq && $bulanReq !== 'Semua' && $bulanReq !== $dataBulan)) {
            
            return response()->json([
                'summary' => ['total' => 0, 'laki' => 0, 'perempuan' => 0],
                'statusPegawai' => [],
                'jenisJabatan' => [],
                'jenisJFT' => [],
                'golonganPNS' => [],
                'golonganPPPK' => [],
                'eselonData' => [],
                'distribusiGender' => [],
                'sebaranOPD' => [],
                'satuanKerjaList' => $satuanKerjaList,
                'tahunList' => $tahunList,
                'bulanList' => $bulanList,
            ]);
        }
        
        $query = DB::table('satuan_kerja')
            ->selectRaw('SUM(pns_l) as pns_l, SUM(pns_p) as pns_p, SUM(pppk_l) as pppk_l, SUM(pppk_p) as pppk_p, SUM(cpns_p) as cpns_p, SUM(cpns_l) as cpns_l');
            
        if ($satker !== 'Semua Satuan Kerja') {
            $query->where('satuan_kerja', $satker);
        }
        
        $satuanKerja = $query->first();
            
        $statusPegawai = [
            ['title' => 'CPNS', 'laki' => (int) $satuanKerja->cpns_l, 'perempuan' => (int) $satuanKerja->cpns_p],
            ['title' => 'PNS', 'laki' => (int) $satuanKerja->pns_l, 'perempuan' => (int) $satuanKerja->pns_p],
            ['title' => 'PPPK', 'laki' => (int) $satuanKerja->pppk_l, 'perempuan' => (int) $satuanKerja->pppk_p],
        ];
        
        $jenisJabatan = DB::table('jenis_jabatan')->get()->map(function($row) {
            return ['title' => $row->jenis_jabatan, 'laki' => $row->laki_laki, 'perempuan' => $row->perempuan];
        })->toArray();
        
        $jenisJFT = DB::table('jft')->get()->map(function($row) {
            return ['title' => $row->jenis_jft, 'laki' => $row->laki_laki, 'perempuan' => $row->perempuan];
        })->toArray();
        
        $golonganPNS = DB::table('golongan_pns')->get()->map(function($row) {
            return ['name' => $row->golongan, 'value' => $row->total];
        })->toArray();
        
        $golonganPPPK = DB::table('golongan_pppk')->get()->map(function($row) {
            return ['name' => $row->golongan, 'value' => $row->total];
        })->toArray();
        
        $eselonData = DB::table('eselon')->get()->map(function($row) {
            return ['name' => $row->eselon, 'value' => $row->total];
        })->toArray();

        $totalLaki = array_reduce($statusPegawai, function($carry, $item) { return $carry + $item['laki']; }, 0);
        $totalPerempuan = array_reduce($statusPegawai, function($carry, $item) { return $carry + $item['perempuan']; }, 0);
        $total = $totalLaki + $totalPerempuan;

        // Distribusi Gender (Donat Chart)
        $distribusiGender = [];
        $apiSummaryOverride = false; // flag untuk override summary dari API

        if ($satker !== 'Semua Satuan Kerja') {
            $distribusiGender = [
                ['name' => 'Laki-laki', 'value' => $totalLaki],
                ['name' => 'Perempuan', 'value' => $totalPerempuan],
            ];
        } else {
            try {
                $bulanMap = [
                    'Januari' => '01', 'Februari' => '02', 'Maret' => '03', 'April' => '04',
                    'Mei' => '05', 'Juni' => '06', 'Juli' => '07', 'Agustus' => '08',
                    'September' => '09', 'Oktober' => '10', 'November' => '11', 'Desember' => '12'
                ];
                
                $apiBulan = ($bulanReq && $bulanReq !== 'Semua' && isset($bulanMap[$bulanReq])) ? $bulanMap[$bulanReq] : '';
                $apiTahun = ($tahunReq && $tahunReq !== 'Semua') ? $tahunReq : '';

                $response = \Illuminate\Support\Facades\Http::withoutVerifying()
                    ->timeout(3)
                    ->acceptJson()
                    ->asJson()
                    ->post('https://simpelbkpsdm.bandungkab.go.id/api/v1/dashboard/main/bezetting-jenis-kelamin', [
                        'bulan' => $apiBulan,
                        'tahun' => $apiTahun
                    ]);

                if ($response->successful()) {
                    $apiData = $response->json('data');
                    if (is_array($apiData) && !empty($apiData)) {
                        $apiLaki = 0;
                        $apiPerempuan = 0;
                        foreach ($apiData as $item) {
                            $name = (isset($item['nama']) && $item['nama'] === 'Laki-Laki') ? 'Laki-laki' : ($item['nama'] ?? 'Perempuan');
                            $jumlah = (int) ($item['jumlah'] ?? 0);
                            $distribusiGender[] = [
                                'name' => $name,
                                'value' => $jumlah
                            ];
                            if ($name === 'Laki-laki') {
                                $apiLaki = $jumlah;
                            } else {
                                $apiPerempuan = $jumlah;
                            }
                        }
                        if ($apiLaki > 0 || $apiPerempuan > 0) {
                            $totalLaki = $apiLaki;
                            $totalPerempuan = $apiPerempuan;
                            $total = $apiLaki + $apiPerempuan;
                            $apiSummaryOverride = true;
                        }
                    }
                }
            } catch (\Exception $e) {
                // Ignore API failure
            }

            // Fallback ke tabel jenis_kelamin jika API eksternal gagal atau kosong
            if (empty($distribusiGender)) {
                $jkRows = DB::table('jenis_kelamin')->get();
                if ($jkRows->isNotEmpty()) {
                    $distribusiGender = $jkRows->map(function($row) {
                        $name = $row->jenis_kelamin === 'Laki-Laki' ? 'Laki-laki' : $row->jenis_kelamin;
                        return ['name' => $name, 'value' => (int) $row->jumlah];
                    })->toArray();
                } else {
                    $distribusiGender = [
                        ['name' => 'Laki-laki', 'value' => $totalLaki],
                        ['name' => 'Perempuan', 'value' => $totalPerempuan],
                    ];
                }
            }
        }

        // Sebaran ASN per OPD (Bar Chart) - Top 12
        $sebaranOPDQuery = DB::table('satuan_kerja')
            ->select('satuan_kerja', 'total', 'pns_l', 'pns_p', 'cpns_l', 'cpns_p', 'pppk_l', 'pppk_p')
            ->orderBy('total', 'desc')
            ->limit(12);

        if ($satker !== 'Semua Satuan Kerja') {
            $sebaranOPDQuery->where('satuan_kerja', $satker);
        }

        $sebaranOPD = $sebaranOPDQuery->get()->map(function($row) {
            return [
                'name' => $row->satuan_kerja, 
                'total' => (int) $row->total,
                'PNS' => (int) $row->pns_l + (int) $row->pns_p,
                'CPNS' => (int) $row->cpns_l + (int) $row->cpns_p,
                'PPPK' => (int) $row->pppk_l + (int) $row->pppk_p,
            ];
        })->toArray();



        return response()->json([
            'summary' => ['total' => $total, 'laki' => $totalLaki, 'perempuan' => $totalPerempuan],
            'statusPegawai' => $statusPegawai,
            'jenisJabatan' => $jenisJabatan,
            'jenisJFT' => $jenisJFT,
            'golonganPNS' => $golonganPNS,
            'golonganPPPK' => $golonganPPPK,
            'eselonData' => $eselonData,
            'distribusiGender' => $distribusiGender,
            'sebaranOPD' => $sebaranOPD,
            'satuanKerjaList' => $satuanKerjaList,
            'tahunList' => $tahunList,
            'bulanList' => $bulanList,
        ]);
    }

    /**
     * Mengambil distribusi jenis kelamin untuk endpoint bezetting.
     *
     * Query params (opsional):
     *   - bulan : nama bulan dalam Bahasa Indonesia
     *   - tahun : tahun (integer)
     */
    public function bezettingJenisKelamin(Request $request): \Illuminate\Http\JsonResponse
    {
        $bulan = $request->input('bulan');
        $tahun = $request->input('tahun');

        $distribusiGender = DB::table('jenis_kelamin')->get();

        $data = $distribusiGender->map(fn($row) => [
            'bulan'  => $bulan,
            'tahun'  => $tahun,
            'nama'   => $row->jenis_kelamin,
            'jumlah' => (string) $row->jumlah,
        ])->values()->all();

        return response()->json([
            'success'   => true,
            'message'   => 'Data berhasil diambil',
            'data'      => $data,
            'parameter' => ['tahun' => $tahun, 'bulan' => $bulan],
            'timestamp' => now()->toIso8601String() . 'Z',
        ]);
    }
}

