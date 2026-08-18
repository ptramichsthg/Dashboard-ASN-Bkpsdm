<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
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
            
            $tahunList = ['Semua', '2024', '2025', '2026', '2027']; // Provide some options so user can interact
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
        $distribusiGender = DB::table('jenis_kelamin')->get()->map(function($row) {
            return ['name' => $row->jenis_kelamin, 'value' => (int) $row->jumlah];
        })->toArray();

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
}
