<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $satker = $request->query('satker', 'Semua Satuan Kerja');
        
        $satuanKerja = DB::table('satuan_kerja')
            ->selectRaw('SUM(pns_l) as pns_l, SUM(pns_p) as pns_p, SUM(pppk_l) as pppk_l, SUM(pppk_p) as pppk_p, SUM(cpns_p) as cpns_p')
            ->first();
            
        $DEFAULT_STATUS_PEGAWAI = [
            ['title' => 'CPNS', 'laki' => 0, 'perempuan' => (int) $satuanKerja->cpns_p],
            ['title' => 'PNS', 'laki' => (int) $satuanKerja->pns_l, 'perempuan' => (int) $satuanKerja->pns_p],
            ['title' => 'PPPK', 'laki' => (int) $satuanKerja->pppk_l, 'perempuan' => (int) $satuanKerja->pppk_p],
        ];
        
        $DEFAULT_JENIS_JABATAN = DB::table('jenis_jabatan')->get()->map(function($row) {
            return ['title' => $row->jenis_jabatan, 'laki' => $row->laki_laki, 'perempuan' => $row->perempuan];
        })->toArray();
        
        $DEFAULT_JENIS_JFT = DB::table('jft')->get()->map(function($row) {
            return ['title' => $row->jenis_jft, 'laki' => $row->laki_laki, 'perempuan' => $row->perempuan];
        })->toArray();
        
        $DEFAULT_GOLONGAN_PNS = DB::table('golongan_pns')->get()->map(function($row) {
            return ['name' => $row->golongan, 'value' => $row->total];
        })->toArray();
        
        $DEFAULT_GOLONGAN_PPPK = DB::table('golongan_pppk')->get()->map(function($row) {
            return ['name' => $row->golongan, 'value' => $row->total];
        })->toArray();
        
        $DEFAULT_ESELON_DATA = DB::table('eselon')->get()->map(function($row) {
            return ['name' => $row->eselon, 'value' => $row->total];
        })->toArray();

        // If 'Semua Satuan Kerja', return null or the default multiplier
        $multiplier = 1.0;
        if ($satker !== 'Semua Satuan Kerja') {
            if ($satker === 'Dinas Pendidikan') {
                $multiplier = 0.3;
            } elseif ($satker === 'Dinas Kesehatan') {
                $multiplier = 0.2;
            } else {
                $multiplier = (strlen($satker) % 15 + 5) / 100;
            }
        }

        $applyMultiplier = function ($data, $isChart = false) use ($multiplier) {
            return array_map(function ($item) use ($multiplier, $isChart) {
                if ($isChart) {
                    $item['value'] = ceil($item['value'] * $multiplier);
                } else {
                    $item['laki'] = ceil($item['laki'] * $multiplier);
                    $item['perempuan'] = ceil($item['perempuan'] * $multiplier);
                }
                return $item;
            }, $data);
        };

        $statusPegawai = $applyMultiplier($DEFAULT_STATUS_PEGAWAI);
        
        $totalLaki = array_reduce($statusPegawai, function($carry, $item) { return $carry + $item['laki']; }, 0);
        $totalPerempuan = array_reduce($statusPegawai, function($carry, $item) { return $carry + $item['perempuan']; }, 0);
        $total = $totalLaki + $totalPerempuan;

        return response()->json([
            'summary' => ['total' => $total, 'laki' => $totalLaki, 'perempuan' => $totalPerempuan],
            'statusPegawai' => $statusPegawai,
            'jenisJabatan' => $applyMultiplier($DEFAULT_JENIS_JABATAN),
            'jenisJFT' => $applyMultiplier($DEFAULT_JENIS_JFT),
            'golonganPNS' => $applyMultiplier($DEFAULT_GOLONGAN_PNS, true),
            'golonganPPPK' => $applyMultiplier($DEFAULT_GOLONGAN_PPPK, true),
            'eselonData' => $applyMultiplier($DEFAULT_ESELON_DATA, true),
        ]);
    }
}
