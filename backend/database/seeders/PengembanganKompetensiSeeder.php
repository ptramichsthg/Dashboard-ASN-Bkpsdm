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
            ['196801011990011001', 'Dr. Ahmad Fauzi, S.Kom., M.T.', $satkerList[0]],
            ['197002151992012002', 'Siti Rahayu, S.E., M.Si.', $satkerList[0]],
            ['198503201010011003', 'Ir. Budi Santoso, M.Eng.', $satkerList[0]],
            ['197805102000031004', 'Hj. Dewi Lestari, S.Pd., M.Pd.', $satkerList[1]],
            ['196912251991011005', 'Drs. Eko Prasetyo, M.M.', $satkerList[1]],
            ['199001052015041006', 'Fitria Nanda, S.STP., M.Si.', $satkerList[1]],
            ['197407181998031007', 'Gunawan Wibowo, S.H., M.H.', $satkerList[2]],
            ['198811122010011008', 'dr. Hana Pertiwi, Sp.A.', $satkerList[2]],
            ['197603041997031009', 'Irwan Setiawan, S.T.', $satkerList[3]],
            ['199205152016041010', 'Juwita Sari, S.E.', $satkerList[3]],
            ['197109091993011011', 'Krisna Aditya, S.Sos., M.AP.', $satkerList[4]],
            ['198402282006012012', 'Linda Maharani, S.KM., M.Kes.', $satkerList[4]],
            ['197806162001011013', 'Muhammad Rizky, S.IP., M.Si.', $satkerList[4]],
            ['199108102015041014', 'Nita Kusumawati, S.Farm., Apt.', $satkerList[5]],
            ['197304071996031015', 'Oka Suryadi, S.H.', $satkerList[5]],
            ['198901272012041016', 'Puspita Dewi, S.Pd.', $satkerList[6]],
            ['197512301997031017', 'Drs. Qomaruddin, M.Ag.', $satkerList[6]],
            ['199307152018041018', 'Rina Fitriani, S.K.M.', $satkerList[7]],
            ['197803121999031019', 'Slamet Riyadi, S.T., M.T.', $satkerList[7]],
            ['198607072009041020', 'Tuti Alawiyah, S.E., Ak.', $satkerList[8]],
            ['199104032014041021', 'Udin Saefudin, A.Md.', $satkerList[8]],
            ['197210201995032022', 'Vera Susanti, S.Psi., M.Psi.', $satkerList[9]],
            ['198204062005011023', 'Wahyu Pratama, S.Kom.', $satkerList[9]],
            ['199209182017041024', 'Xenia Pramudya, S.ST.', $satkerList[0]],
            ['197506221998031025', 'Dr. Yusuf Hanafi, M.A.', $satkerList[1]],
            ['198703152008011026', 'Zainab Mutia, S.Gz.', $satkerList[2]],
            ['199011282013041027', 'Agus Hermawan, S.H., M.Kn.', $satkerList[3]],
            ['197901052003011028', 'Bayu Nugroho, S.Pt.', $satkerList[4]],
            ['198512102009042029', 'Citra Permata, S.Kep., Ns.', $satkerList[5]],
            ['199306072017042030', 'Dian Ratnasari, S.I.Kom.', $satkerList[6]],
        ];

        $bulan = 'Agustus';
        $tahun = 2026;

        $records = [];

        // Skenario JP per ASN: Dominan KURANG (<20), sebagian LEBIH (>20), tidak ada/sangat jarang yang pas.
        $jpSkenario = [
            0  => [10, 5],          // 15 (Kurang)
            1  => [8],              // 8 (Kurang)
            2  => [5, 4],           // 9 (Kurang)
            3  => [15, 10],         // 25 (Lebih/Reward)
            4  => [6, 6],           // 12 (Kurang)
            5  => [10, 3],          // 13 (Kurang)
            6  => [5],              // 5 (Kurang)
            7  => [12, 10],         // 22 (Lebih/Reward)
            8  => [8, 4],           // 12 (Kurang)
            9  => [6, 8],           // 14 (Kurang)
            10 => [30],             // 30 (Lebih/Reward)
            11 => [5, 2],           // 7 (Kurang)
            12 => [10],             // 10 (Kurang)
            13 => [4, 4],           // 8 (Kurang)
            14 => [18, 5],          // 23 (Lebih/Reward)
            15 => [12],             // 12 (Kurang)
            16 => [8, 2, 4],        // 14 (Kurang)
            17 => [20, 5],          // 25 (Lebih/Reward)
            18 => [10, 5],          // 15 (Kurang)
            19 => [4],              // 4 (Kurang)
            20 => [5, 6],           // 11 (Kurang)
            21 => [15, 10],         // 25 (Lebih/Reward)
            22 => [10, 8],          // 18 (Kurang)
            23 => [5, 5],           // 10 (Kurang)
            24 => [8, 2],           // 10 (Kurang)
            25 => [14, 8],          // 22 (Lebih/Reward)
            26 => [10],             // 10 (Kurang)
            27 => [7, 6],           // 13 (Kurang)
            28 => [16],             // 16 (Kurang)
            29 => [8, 8, 8],        // 24 (Lebih/Reward)
        ];

        foreach ($asnData as $idx => $asn) {
            $jpList = $jpSkenario[$idx] ?? [10];
            foreach ($jpList as $jpVal) {
                // Pilih jenis dan nama pelatihan secara deterministik
                $jenisKey = $jenisPelatihan[($idx + count($jpList)) % 4];
                $pilihanNama = $namaPelatihan[$jenisKey];
                $namaPil = $pilihanNama[$idx % count($pilihanNama)];

                $bidangList = ['Bidang Perencanaan', 'Bidang Mutasi dan Promosi', 'Bidang Pengembangan Aparatur', 'Bidang Penilaian Kinerja', 'Sekretariat'];
                $penyelenggaraList = ['BKN Regional', 'LAN RI', 'BPSDM Provinsi', 'Pusdiklat Kemendagri', 'Lembaga Pelatihan Swasta'];
                
                $bidang = $bidangList[$idx % count($bidangList)];
                $penyelenggara = $penyelenggaraList[($idx + $jpVal) % count($penyelenggaraList)];
                $hari = ($idx + $jpVal) % 28 + 1;
                $tanggal = sprintf("2026-08-%02d", $hari);

                $records[] = [
                    'nip'              => $asn[0],
                    'nama_asn'         => $asn[1],
                    'satuan_kerja'     => $asn[2],
                    'bidang'           => $bidang,
                    'nama_pelatihan'   => $namaPil,
                    'jenis_pelatihan'  => $jenisKey,
                    'tanggal'          => $tanggal,
                    'penyelenggara'    => $penyelenggara,
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
