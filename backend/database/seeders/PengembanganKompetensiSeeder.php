<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PengembanganKompetensiSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('pengembangan_kompetensi')->truncate();

        $satkerList = [
            'Dinas Pendidikan',
            'Dinas Kesehatan',
            'Dinas Pekerjaan Umum dan Penataan Ruang',
            'Dinas Sosial',
            'Badan Kepegawaian dan Pengembangan SDM',
            'Dinas Perhubungan',
            'Dinas Lingkungan Hidup',
            'Dinas Kependudukan dan Pencatatan Sipil',
            'Dinas Komunikasi dan Informatika',
            'Sekretariat Daerah',
        ];

        $jenisPelatihan = ['Teknis', 'Kepemimpinan', 'Fungsional', 'Sosialisasi'];

        $namaPelatihan = [
            'Teknis'        => ['Pelatihan Aplikasi e-Office', 'Pelatihan Sistem Informasi', 'Bimtek Pengelolaan Arsip Digital', 'Pelatihan Pengadaan Barang/Jasa', 'Workshop Manajemen Keuangan Daerah'],
            'Kepemimpinan'  => ['Diklat PIM III', 'Diklat PIM IV', 'Pelatihan Kepemimpinan Nasional', 'Workshop Manajemen Perubahan'],
            'Fungsional'    => ['Diklat Fungsional Analis Kebijakan', 'Pelatihan Jabatan Fungsional Auditor', 'Bimtek Perencana', 'Diklat Fungsional Statistisi'],
            'Sosialisasi'   => ['Sosialisasi Peraturan ASN Terbaru', 'Sosialisasi Sistem Merit', 'Sosialisasi e-Kinerja', 'Webinar Reformasi Birokrasi', 'Sosialisasi Penilaian Prestasi Kerja'],
        ];

        $asnData = [
            // Format: [nip, nama, satker]
            ['196801011990011001', 'Ahmad Fauzi', $satkerList[0]],
            ['197002151992012002', 'Siti Rahayu', $satkerList[0]],
            ['198503201010011003', 'Budi Santoso', $satkerList[0]],
            ['197805102000031004', 'Dewi Lestari', $satkerList[1]],
            ['196912251991011005', 'Eko Prasetyo', $satkerList[1]],
            ['199001052015041006', 'Fitria Nanda', $satkerList[1]],
            ['197407181998031007', 'Gunawan Wibowo', $satkerList[2]],
            ['198811122010011008', 'Hana Pertiwi', $satkerList[2]],
            ['197603041997031009', 'Irwan Setiawan', $satkerList[3]],
            ['199205152016041010', 'Juwita Sari', $satkerList[3]],
            ['197109091993011011', 'Krisna Aditya', $satkerList[4]],
            ['198402282006012012', 'Linda Maharani', $satkerList[4]],
            ['197806162001011013', 'Muhammad Rizky', $satkerList[4]],
            ['199108102015041014', 'Nita Kusumawati', $satkerList[5]],
            ['197304071996031015', 'Oka Suryadi', $satkerList[5]],
            ['198901272012041016', 'Puspita Dewi', $satkerList[6]],
            ['197512301997031017', 'Qomaruddin', $satkerList[6]],
            ['199307152018041018', 'Rina Fitriani', $satkerList[7]],
            ['197803121999031019', 'Slamet Riyadi', $satkerList[7]],
            ['198607072009041020', 'Tuti Alawiyah', $satkerList[8]],
            ['199104032014041021', 'Udin Saefudin', $satkerList[8]],
            ['197210201995032022', 'Vera Susanti', $satkerList[9]],
            ['198204062005011023', 'Wahyu Pratama', $satkerList[9]],
            ['199209182017041024', 'Xenia Pramudya', $satkerList[0]],
            ['197506221998031025', 'Yusuf Hanafi', $satkerList[1]],
            ['198703152008011026', 'Zainab Mutia', $satkerList[2]],
            ['199011282013041027', 'Agus Hermawan', $satkerList[3]],
            ['197901052003011028', 'Bayu Nugroho', $satkerList[4]],
            ['198512102009042029', 'Citra Permata', $satkerList[5]],
            ['199306072017042030', 'Dian Ratnasari', $satkerList[6]],
        ];

        $bulan = 'Agustus';
        $tahun = 2026;

        $records = [];

        // Skenario JP per ASN yang bervariasi (beberapa kurang, beberapa pas, beberapa lebih)
        $jpSkenario = [
            // index ASN => array of jp pelatihan (total akan dihitung)
            0  => [8, 15],          // total 23 JP → memenuhi + reward
            1  => [5, 10],          // total 15 JP → kurang 5 JP
            2  => [10, 12],         // total 22 JP → memenuhi + reward
            3  => [6],              // total 6 JP  → kurang 14 JP
            4  => [20],             // total 20 JP → tepat target
            5  => [7, 5, 10],       // total 22 JP → memenuhi + reward
            6  => [4, 8],           // total 12 JP → kurang 8 JP
            7  => [10, 15, 8],      // total 33 JP → reward besar
            8  => [12, 10],         // total 22 JP → memenuhi + reward
            9  => [3, 5],           // total 8 JP  → kurang 12 JP
            10 => [20, 10],         // total 30 JP → reward
            11 => [8, 4],           // total 12 JP → kurang 8 JP
            12 => [5, 10, 8],       // total 23 JP → memenuhi + reward
            13 => [6, 6],           // total 12 JP → kurang 8 JP
            14 => [20],             // total 20 JP → tepat target
            15 => [15, 8],          // total 23 JP → memenuhi + reward
            16 => [5],              // total 5 JP  → kurang 15 JP
            17 => [10, 12],         // total 22 JP → memenuhi + reward
            18 => [8, 3],           // total 11 JP → kurang 9 JP
            19 => [20, 15],         // total 35 JP → reward besar
            20 => [6, 10],          // total 16 JP → kurang 4 JP
            21 => [12, 10],         // total 22 JP → memenuhi + reward
            22 => [4, 8, 5],        // total 17 JP → kurang 3 JP
            23 => [20],             // total 20 JP → tepat target
            24 => [6, 8],           // total 14 JP → kurang 6 JP
            25 => [10, 12, 5],      // total 27 JP → reward
            26 => [5, 6],           // total 11 JP → kurang 9 JP
            27 => [20, 8],          // total 28 JP → reward
            28 => [4, 6],           // total 10 JP → kurang 10 JP
            29 => [10, 12],         // total 22 JP → memenuhi + reward
        ];

        foreach ($asnData as $idx => $asn) {
            $jpList = $jpSkenario[$idx] ?? [10];
            foreach ($jpList as $jpVal) {
                // Pilih jenis dan nama pelatihan secara deterministik
                $jenisKey = $jenisPelatihan[($idx + count($jpList)) % 4];
                $pilihanNama = $namaPelatihan[$jenisKey];
                $namaPil = $pilihanNama[$idx % count($pilihanNama)];

                $records[] = [
                    'nip'              => $asn[0],
                    'nama_asn'         => $asn[1],
                    'satuan_kerja'     => $asn[2],
                    'nama_pelatihan'   => $namaPil,
                    'jenis_pelatihan'  => $jenisKey,
                    'jp'               => $jpVal,
                    'bulan'            => $bulan,
                    'tahun'            => $tahun,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ];
            }
        }

        DB::table('pengembangan_kompetensi')->insert($records);
    }
}
