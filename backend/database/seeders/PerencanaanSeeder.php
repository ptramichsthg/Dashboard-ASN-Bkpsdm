<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PerencanaanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create('id_ID');

        $opdList = [
            'DINAS KESEHATAN', 'DINAS PENDIDIKAN', 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
            'DINAS PEKERJAAN UMUM DAN TATA RUANG', 'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL',
            'RUMAH SAKIT UMUM DAERAH', 'INSPEKTORAT DAERAH', 'DINAS KOMUNIKASI DAN INFORMATIKA',
            'BADAN PENDAPATAN DAERAH', 'SEKRETARIAT DAERAH'
        ];

        $jabatanList = [
            'Kepala Bidang Pelayanan Kesehatan', 'Kepala Seksi Kurikulum', 'Analis SDM Aparatur Ahli Muda',
            'Kepala UPTD Pengelolaan Jalan', 'Administrator Database', 'Dokter Spesialis Anak',
            'Auditor Ahli Madya', 'Pranata Komputer Ahli Pertama', 'Penilai Pajak Daerah',
            'Kepala Bagian Hukum', 'Perawat Ahli Pertama', 'Guru Kelas Ahli Pertama'
        ];

        $statusList = ['Kosong', 'Kurang', 'Kosong (Diisi Plt)', 'Kurang (Butuh 3, Ada 1)'];
        $estimasiList = ['Promosi', 'Mutasi', 'CPNS 2026', 'PPPK 2026', 'CPNS/PPPK 2026'];
        $kualifikasiList = ['S1 Kedokteran', 'S1 Pendidikan', 'S1 Manajemen', 'S1 Teknik Sipil', 'S1 Teknik Informatika', 'S1 Akuntansi', 'S1 Ilmu Hukum', 'Dokter Spesialis Anak', 'S1 Keperawatan + Ners', 'S1 PGSD'];

        $data = [];
        for ($i = 0; $i < 60; $i++) {
            $data[] = [
                'opd' => $faker->randomElement($opdList),
                'jabatan' => $faker->randomElement($jabatanList),
                'status' => $faker->randomElement($statusList),
                'kebutuhan' => $faker->numberBetween(1, 50),
                'estimasi_pengisian' => $faker->randomElement($estimasiList),
                'masa_jabatan_sebelumnya' => $faker->boolean(70) ? $faker->monthName() . ' ' . $faker->year() . ' - ' . $faker->monthName() . ' ' . $faker->year() : '-',
                'mulai_kosong' => $faker->monthName() . ' ' . $faker->year(),
                'kualifikasi' => $faker->randomElement($kualifikasiList),
                'kelas_jabatan' => (string)$faker->numberBetween(5, 12),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        \Illuminate\Support\Facades\DB::table('perencanaan')->insert($data);
    }
}
