<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $satker = $request->query('satker', 'Semua Satuan Kerja');
        
        $DEFAULT_STATUS_PEGAWAI = [
            ['title' => 'CPNS', 'laki' => 45, 'perempuan' => 30],
            ['title' => 'PNS', 'laki' => 380, 'perempuan' => 340],
            ['title' => 'PPPK', 'laki' => 75, 'perempuan' => 130],
        ];
        
        $DEFAULT_JENIS_JABATAN = [
            ['title' => 'Struktural', 'laki' => 120, 'perempuan' => 80],
            ['title' => 'Fungsional', 'laki' => 210, 'perempuan' => 260],
            ['title' => 'Pelaksana', 'laki' => 170, 'perempuan' => 160],
        ];
        
        $DEFAULT_JENIS_JFT = [
            ['title' => 'Guru', 'laki' => 90, 'perempuan' => 150],
            ['title' => 'Tenaga Kesehatan', 'laki' => 40, 'perempuan' => 60],
            ['title' => 'Teknis', 'laki' => 80, 'perempuan' => 50],
        ];
        
        $DEFAULT_GOLONGAN_PNS = [
            ['name' => 'IV/e', 'value' => 5], ['name' => 'IV/d', 'value' => 12], ['name' => 'IV/c', 'value' => 28],
            ['name' => 'IV/b', 'value' => 55], ['name' => 'IV/a', 'value' => 80], ['name' => 'III/d', 'value' => 100],
            ['name' => 'III/c', 'value' => 90], ['name' => 'III/b', 'value' => 75], ['name' => 'III/a', 'value' => 60],
            ['name' => 'II/d', 'value' => 45],
        ];
        
        $DEFAULT_GOLONGAN_PPPK = [
            ['name' => 'Ahli Utama', 'value' => 8], ['name' => 'Ahli Madya', 'value' => 20],
            ['name' => 'Ahli Muda', 'value' => 45], ['name' => 'Ahli Pertama', 'value' => 60],
            ['name' => 'Penyelia', 'value' => 35], ['name' => 'Mahir', 'value' => 50],
            ['name' => 'Terampil', 'value' => 40], ['name' => 'Pemula', 'value' => 25],
        ];
        
        $DEFAULT_ESELON_DATA = [
            ['name' => 'Eselon I', 'value' => 2], ['name' => 'Eselon II', 'value' => 10],
            ['name' => 'Eselon III', 'value' => 35], ['name' => 'Eselon IV', 'value' => 80],
            ['name' => 'Non Eselon', 'value' => 390],
        ];

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
