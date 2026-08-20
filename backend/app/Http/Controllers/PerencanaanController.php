<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PerencanaanController extends Controller
{
    public function index(Request $request)
    {
        // 1. Data Dummy Mentah (Jabatan Kosong)
        $allData = [
            ['id' => 1, 'opd' => 'DINAS KESEHATAN', 'jabatan' => 'Kepala Bidang Pelayanan Kesehatan', 'status' => 'Kosong (Diisi Plt)', 'kebutuhan' => 1, 'estimasi_pengisian' => 'Promosi', 'masa_jabatan_sebelumnya' => '08/2018 - 10/2023', 'mulai_kosong' => '11/2023', 'kualifikasi' => 'S1 Kedokteran / S1 Kesehatan Masyarakat', 'kelas_jabatan' => '11'],
            ['id' => 2, 'opd' => 'DINAS PENDIDIKAN', 'jabatan' => 'Kepala Seksi Kurikulum', 'status' => 'Kosong', 'kebutuhan' => 2, 'estimasi_pengisian' => 'Mutasi', 'masa_jabatan_sebelumnya' => '01/2020 - 12/2023', 'mulai_kosong' => '01/2024', 'kualifikasi' => 'S1 Pendidikan', 'kelas_jabatan' => '9'],
            ['id' => 3, 'opd' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA', 'jabatan' => 'Analis SDM Aparatur Ahli Muda', 'status' => 'Kurang (Butuh 3, Ada 1)', 'kebutuhan' => 2, 'estimasi_pengisian' => 'CPNS 2026', 'masa_jabatan_sebelumnya' => '-', 'mulai_kosong' => '02/2024 (Penambahan ABK)', 'kualifikasi' => 'S1 Manajemen / Administrasi Negara / Hukum', 'kelas_jabatan' => '9'],
            ['id' => 4, 'opd' => 'DINAS PEKERJAAN UMUM DAN TATA RUANG', 'jabatan' => 'Kepala UPTD Pengelolaan Jalan', 'status' => 'Kosong (Diisi Plt)', 'kebutuhan' => 1, 'estimasi_pengisian' => 'Promosi', 'masa_jabatan_sebelumnya' => '03/2019 - 09/2023', 'mulai_kosong' => '10/2023', 'kualifikasi' => 'S1 Teknik Sipil', 'kelas_jabatan' => '9'],
            ['id' => 5, 'opd' => 'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL', 'jabatan' => 'Administrator Database', 'status' => 'Kosong', 'kebutuhan' => 1, 'estimasi_pengisian' => 'PPPK 2026', 'masa_jabatan_sebelumnya' => '-', 'mulai_kosong' => '01/2024 (Pensiun)', 'kualifikasi' => 'S1 Teknik Informatika / Sistem Informasi', 'kelas_jabatan' => '8'],
            ['id' => 6, 'opd' => 'RUMAH SAKIT UMUM DAERAH', 'jabatan' => 'Dokter Spesialis Anak', 'status' => 'Kurang', 'kebutuhan' => 2, 'estimasi_pengisian' => 'CPNS 2026', 'masa_jabatan_sebelumnya' => '09/2017 - 05/2024', 'mulai_kosong' => '06/2024', 'kualifikasi' => 'Dokter Spesialis Anak', 'kelas_jabatan' => '10'],
            ['id' => 7, 'opd' => 'INSPEKTORAT DAERAH', 'jabatan' => 'Auditor Ahli Madya', 'status' => 'Kurang', 'kebutuhan' => 1, 'estimasi_pengisian' => 'Mutasi', 'masa_jabatan_sebelumnya' => '02/2016 - 08/2023', 'mulai_kosong' => '09/2023', 'kualifikasi' => 'S1 Akuntansi / Manajemen', 'kelas_jabatan' => '11'],
            ['id' => 8, 'opd' => 'DINAS KOMUNIKASI DAN INFORMATIKA', 'jabatan' => 'Pranata Komputer Ahli Pertama', 'status' => 'Kurang', 'kebutuhan' => 3, 'estimasi_pengisian' => 'CPNS 2026', 'masa_jabatan_sebelumnya' => '-', 'mulai_kosong' => '01/2024 (Penambahan ABK)', 'kualifikasi' => 'S1 Ilmu Komputer / Teknik Informatika', 'kelas_jabatan' => '8'],
            ['id' => 9, 'opd' => 'BADAN PENDAPATAN DAERAH', 'jabatan' => 'Penilai Pajak Daerah', 'status' => 'Kosong', 'kebutuhan' => 2, 'estimasi_pengisian' => 'PPPK 2026', 'masa_jabatan_sebelumnya' => '12/2019 - 11/2023', 'mulai_kosong' => '12/2023', 'kualifikasi' => 'S1 Ekonomi / Perpajakan / Akuntansi', 'kelas_jabatan' => '8'],
            ['id' => 10, 'opd' => 'SEKRETARIAT DAERAH', 'jabatan' => 'Kepala Bagian Hukum', 'status' => 'Kosong (Diisi Plt)', 'kebutuhan' => 1, 'estimasi_pengisian' => 'Promosi', 'masa_jabatan_sebelumnya' => '07/2018 - 02/2024', 'mulai_kosong' => '03/2024', 'kualifikasi' => 'S1 Ilmu Hukum', 'kelas_jabatan' => '12'],
            ['id' => 11, 'opd' => 'DINAS KESEHATAN', 'jabatan' => 'Perawat Ahli Pertama', 'status' => 'Kurang', 'kebutuhan' => 15, 'estimasi_pengisian' => 'CPNS/PPPK 2026', 'masa_jabatan_sebelumnya' => '-', 'mulai_kosong' => '01/2024', 'kualifikasi' => 'S1 Keperawatan + Ners', 'kelas_jabatan' => '8'],
            ['id' => 12, 'opd' => 'DINAS PENDIDIKAN', 'jabatan' => 'Guru Kelas Ahli Pertama', 'status' => 'Kurang', 'kebutuhan' => 50, 'estimasi_pengisian' => 'PPPK 2026', 'masa_jabatan_sebelumnya' => '-', 'mulai_kosong' => 'Tahun 2023/2024', 'kualifikasi' => 'S1 PGSD', 'kelas_jabatan' => '8'],
        ];

        // Dapatkan parameter filter
        $opdFilter = $request->query('opd', 'Semua');
        $search = strtolower($request->query('search', ''));
        $tahun = $request->query('tahun', '2026'); // Filter statis tahun ini

        // 2. Filter Data
        $filteredData = collect($allData)->filter(function ($item) use ($opdFilter, $search) {
            $matchOpd = ($opdFilter === 'Semua' || $item['opd'] === $opdFilter);
            $matchSearch = empty($search) || str_contains(strtolower($item['jabatan']), $search) || str_contains(strtolower($item['opd']), $search);
            return $matchOpd && $matchSearch;
        })->values();

        // 3. Ringkasan KPI
        $totalJabatanKosong = $filteredData->count(); // Berapa record jabatan yang kosong/kurang
        $totalKebutuhanPegawai = $filteredData->sum('kebutuhan'); // Total orang yang dibutuhkan

        // Simulasi proyeksi pensiun per tahun (statis untuk demo)
        $proyeksiPensiun = [
            '2024' => 150,
            '2025' => 180,
            '2026' => 210, // Tahun terpilih misal
            '2027' => 135,
        ];
        $pensiunTahunIni = $proyeksiPensiun[$tahun] ?? 100;

        // 4. Data untuk Chart (Sebaran OPD)
        // Dikelompokkan berdasar OPD, dihitung jumlah kebutuhannya
        $perOpd = $filteredData->groupBy('opd')->map(function ($group, $opdName) {
            return [
                'satuan_kerja' => $opdName,
                'jumlah_jabatan_kosong' => $group->count(),
                'total_kebutuhan' => $group->sum('kebutuhan'),
            ];
        })->values()->sortByDesc('total_kebutuhan')->values();

        // 5. Daftar OPD unik untuk dropdown filter
        $opdList = collect($allData)->pluck('opd')->unique()->sort()->values();

        return response()->json([
            'ringkasan' => [
                'total_jabatan_kosong' => $totalJabatanKosong,
                'proyeksi_pensiun' => $pensiunTahunIni,
                'total_kebutuhan_pegawai' => $totalKebutuhanPegawai,
                'formasi_disetujui' => (int)($totalKebutuhanPegawai * 0.8), // Simulasi 80% disetujui
            ],
            'per_opd' => $perOpd,
            'data' => $filteredData,
            'opd_list' => $opdList,
        ]);
    }
}
