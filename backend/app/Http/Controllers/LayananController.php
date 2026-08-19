<?php

namespace App\Http\Controllers;

use App\Models\Layanan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LayananController extends Controller
{
    public function index(Request $request)
    {
        $query = Layanan::query();

        // Filters
        if ($request->has('tahun') && $request->tahun != 'Semua Tahun' && $request->tahun != '') {
            $query->whereYear('tanggalPengajuan', $request->tahun);
        }

        if ($request->has('bulan') && $request->bulan != 'Semua Bulan' && $request->bulan != '') {
            $bulanMap = [
                'Januari' => 1, 'Februari' => 2, 'Maret' => 3, 'April' => 4, 'Mei' => 5, 'Juni' => 6,
                'Juli' => 7, 'Agustus' => 8, 'September' => 9, 'Oktober' => 10, 'November' => 11, 'Desember' => 12
            ];
            if (isset($bulanMap[$request->bulan])) {
                $query->whereMonth('tanggalPengajuan', $bulanMap[$request->bulan]);
            }
        }

        if ($request->has('satker') && $request->satker != 'Semua Perangkat Daerah' && $request->satker != '') {
            $query->where('perangkatDaerah', $request->satker);
        }
        
        if ($request->has('jenis_layanan') && $request->jenis_layanan != 'Semua Layanan' && $request->jenis_layanan != '') {
            $query->where('layanan', $request->jenis_layanan);
        }
        
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%")
                  ->orWhere('nomorSurat', 'like', "%{$search}%");
            });
        }

        $layanans = $query->orderBy('tanggalPengajuan', 'desc')->get();

        // Calculate stats
        $totalLayanan = $layanans->count();
        $layananSelesai = $layanans->where('status', 'Selesai')->count();
        $layananProses = $layanans->where('status', 'Proses')->count();
        $layananUsulan = $layanans->where('status', 'Usulan')->count();

        // Top 3 Layanan
        $top3 = $layanans->groupBy('layanan')
            ->map(function ($group) {
                return ['name' => $group->first()->layanan, 'total' => $group->count()];
            })
            ->sortByDesc('total')
            ->take(3)
            ->values();

        return response()->json([
            'status' => 'success',
            'data' => [
                'layanans' => $layanans,
                'stats' => [
                    'total' => $totalLayanan,
                    'selesai' => $layananSelesai,
                    'proses' => $layananProses,
                    'usulan' => $layananUsulan,
                ],
                'top3' => $top3
            ]
        ]);
    }
}
