<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Pemberhentian;
use Carbon\Carbon;

class PemberhentianSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $satuanKerja = [
            'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
            'DINAS PENDIDIKAN',
            'DINAS KESEHATAN',
            'DINAS PEKERJAAN UMUM DAN TATA RUANG',
            'DINAS SOSIAL',
            'DINAS PERHUBUNGAN',
            'SEKRETARIAT DAERAH',
            'INSPEKTORAT DAERAH',
            'BADAN PERENCANAAN PEMBANGUNAN, RISET DAN INOVASI DAERAH',
            'BADAN KEUANGAN DAN ASET DAERAH',
            'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL',
            'DINAS KOMUNIKASI DAN INFORMATIKA, STATISTIK DAN PERSANDIAN',
            'DINAS PERPUSTAKAAN DAN ARSIP',
            'DINAS PEMBERDAYAAN MASYARAKAT DAN DESA',
            'SATUAN POLISI PAMONG PRAJA',
        ];

        $jabatan = [
            'Kepala Bidang',
            'Kepala Seksi',
            'Kepala Sub Bagian',
            'Staf Administrasi',
            'Guru',
            'Dokter',
            'Perawat',
            'Bidan',
            'Analis',
            'Pengawas',
            'Arsiparis',
            'Pranata Komputer',
            'Sekretaris',
            'Bendahara',
        ];

        $golongan = ['IV/e', 'IV/d', 'IV/c', 'IV/b', 'IV/a', 'III/d', 'III/c', 'III/b', 'III/a', 'II/d', 'II/c', 'II/b'];

        $namaList = [
            'Dr. Ir. H. Ahmad Suhendar, M.Si', 'Dra. Hj. Siti Nurjanah, M.M', 'H. Dedi Hermawan, S.Sos., M.Si',
            'Hj. Rina Mardiani, S.Pd., M.Pd', 'Drs. H. Iwan Setiawan', 'Hj. Yuni Ratnasari, S.E., M.M',
            'Dr. H. Asep Hidayat, M.Pd', 'Dra. Hj. Lilis Suryani, M.Si', 'H. Dadan Kusmana, S.H., M.H',
            'Hj. Nia Kurniawati, S.Kom., M.T', 'Drs. H. Ujang Koswara', 'Hj. Tuti Sumarni, S.E',
            'H. Endang Supriatna, S.IP., M.AP', 'Dra. Hj. Rini Purnama', 'H. Hendra Gunawan, S.T., M.T',
            'Hj. Susi Susanti, S.Kep., Ners', 'Drs. H. Bambang Sutrisno', 'Hj. Dewi Anggraeni, S.Pd',
            'H. Ade Kurnia, S.Sos., M.Si', 'Dra. Hj. Maya Sari', 'H. Tatang Supriatna, S.E., M.M',
            'Hj. Lina Marlina, S.Pd., M.Pd', 'Drs. H. Cecep Hermawan', 'Hj. Fitri Handayani, S.Kom',
            'H. Dian Nugraha, S.H', 'Dra. Hj. Wati Sugiharti', 'H. Irfan Hidayat, S.T',
            'Hj. Yanti Setiawati, S.Kep', 'Drs. H. Agus Sutarya', 'Hj. Rini Astuti, S.E',
            'H. Rizal Ramdhani, S.IP', 'Dra. Hj. Nani Suhartini', 'H. Wahyu Hidayat, S.T., M.T',
            'Hj. Eka Nursanti, S.Pd', 'Drs. H. Deden Supriyadi', 'Hj. Sri Rahayu, S.E., M.M',
            'H. Ferry Setiawan, S.Sos', 'Dra. Hj. Yuyun Yuningsih', 'H. Gunawan Wijaya, S.Kom',
            'Hj. Ani Kusmiati, S.Pd., M.Pd', 'Drs. H. Iman Sulaiman', 'Hj. Rani Puspita, S.Kep., Ners',
            'H. Dudi Suhendar, S.E', 'Dra. Hj. Imas Masitoh', 'H. Yudi Permana, S.T',
            'Hj. Nunung Nurhayati, S.Pd', 'Drs. H. Usman Abdullah', 'Hj. Lili Herliani, S.E., M.Ak',
            'H. Rahman Hakim, S.IP., M.Si', 'Dra. Hj. Euis Sumiati', 'H. Rian Firmansyah, S.Kom., M.T',
            'Hj. Tita Rosita, S.Pd', 'Drs. H. Wawan Setiawan', 'Hj. Cucu Suhartini, S.Kep',
            'H. Deni Kusnadi, S.Sos., M.Si', 'Dra. Hj. Ai Halimah', 'H. Dede Kusnandar, S.E., M.M',
            'Hj. Yeti Suryati, S.Pd., M.Pd', 'Drs. H. Endang Saefudin',
        ];

        $jenisPemberhentian = ['Pensiun BUP', 'Pensiun APS', 'Mengundurkan Diri', 'Meninggal Dunia', 'Diberhentikan'];
        $status = ['Usulan', 'Proses Verifikasi', 'Disetujui', 'SK Terbit', 'Selesai', 'Ditolak'];

        $alasanByJenis = [
            'Pensiun BUP' => [
                'Telah mencapai batas usia pensiun 60 tahun sesuai ketentuan yang berlaku',
                'Memasuki usia pensiun sesuai peraturan kepegawaian',
                'Telah mencapai batas usia pensiun dan memenuhi masa kerja minimal',
            ],
            'Pensiun APS' => [
                'Mengajukan pensiun dini atas permintaan sendiri dengan alasan kesehatan',
                'Mengajukan pensiun atas permintaan sendiri untuk fokus keluarga',
                'Pensiun atas keinginan sendiri setelah masa kerja 30 tahun',
            ],
            'Mengundurkan Diri' => [
                'Mengundurkan diri untuk menempuh karir di sektor swasta',
                'Mengajukan pengunduran diri karena alasan pribadi',
                'Mundur untuk melanjutkan pendidikan ke luar negeri',
            ],
            'Meninggal Dunia' => [
                'Meninggal dunia karena sakit',
                'Meninggal dunia dalam kecelakaan',
                'Berpulang ke rahmatullah setelah sakit lama',
            ],
            'Diberhentikan' => [
                'Diberhentikan karena melanggar kode etik ASN',
                'Diberhentikan tidak dengan hormat karena tindak pidana',
                'Diberhentikan karena tidak memenuhi kewajiban sebagai ASN',
            ],
        ];

        $data = [];
        $usedNip = [];

        // Generate 60 data
        for ($i = 0; $i < 60; $i++) {
            // Generate unique NIP
            do {
                $nip = '19' . rand(60, 75) . '0' . rand(1, 12) . rand(10, 28) . '20' . rand(10, 23) . sprintf('%02d', rand(1, 12)) . rand(1, 9) . sprintf('%03d', rand(1, 999));
            } while (in_array($nip, $usedNip));
            $usedNip[] = $nip;

            // Distribusi jenis pemberhentian sesuai plan
            if ($i < 36) {
                $jenis = 'Pensiun BUP'; // 60%
            } elseif ($i < 45) {
                $jenis = 'Pensiun APS'; // 15%
            } elseif ($i < 51) {
                $jenis = 'Meninggal Dunia'; // 10%
            } elseif ($i < 57) {
                $jenis = 'Mengundurkan Diri'; // 10%
            } else {
                $jenis = 'Diberhentikan'; // 5%
            }

            // Distribusi status
            if ($i < 12) {
                $currentStatus = 'Usulan'; // 20%
            } elseif ($i < 30) {
                $currentStatus = 'Proses Verifikasi'; // 30%
            } elseif ($i < 42) {
                $currentStatus = 'Disetujui'; // 20%
            } elseif ($i < 54) {
                $currentStatus = 'SK Terbit'; // 20%
            } elseif ($i < 59) {
                $currentStatus = 'Selesai'; // 8%
            } else {
                $currentStatus = 'Ditolak'; // 2%
            }

            // Tanggal usulan: random di 2025-2026
            $tanggalUsulan = Carbon::create(rand(2025, 2026), rand(1, 8), rand(1, 28));
            
            // Tanggal pemberhentian: 3-12 bulan setelah usulan
            $tanggalPemberhentian = (clone $tanggalUsulan)->addMonths(rand(3, 12));

            // Nomor SK dan tanggal SK jika status sudah SK Terbit/Selesai
            $nomorSk = null;
            $tanggalSk = null;
            if (in_array($currentStatus, ['SK Terbit', 'Selesai'])) {
                $nomorSk = '800/' . rand(100, 999) . '/BKPSDM/' . $tanggalUsulan->year;
                $tanggalSk = (clone $tanggalUsulan)->addMonths(rand(1, 3));
            }

            // Generate email
            $namaParts = explode(' ', $namaList[$i % count($namaList)]);
            $firstName = strtolower(preg_replace('/[^a-zA-Z]/', '', $namaParts[count($namaParts) - 1]));
            $emailPegawai = $firstName . '.' . substr($nip, -4) . '@mail.com';
            $emailAtasan = 'atasan.' . $firstName . '@bkpsdm-bandung.go.id';

            $data[] = [
                'nip' => $nip,
                'nama' => $namaList[$i % count($namaList)],
                'satuan_kerja' => $satuanKerja[array_rand($satuanKerja)],
                'jabatan' => $jabatan[array_rand($jabatan)],
                'golongan' => $golongan[array_rand($golongan)],
                'jenis_pemberhentian' => $jenis,
                'alasan' => $alasanByJenis[$jenis][array_rand($alasanByJenis[$jenis])],
                'tanggal_usulan' => $tanggalUsulan,
                'tanggal_pemberhentian' => $tanggalPemberhentian,
                'nomor_sk' => $nomorSk,
                'tanggal_sk' => $tanggalSk,
                'status' => $currentStatus,
                'email_pegawai' => $emailPegawai,
                'email_atasan' => $emailAtasan,
                'catatan' => $currentStatus === 'Ditolak' ? 'Dokumen tidak lengkap, perlu dilengkapi' : null,
                'file_pendukung' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insert data
        foreach (array_chunk($data, 30) as $chunk) {
            Pemberhentian::insert($chunk);
        }
    }
}
