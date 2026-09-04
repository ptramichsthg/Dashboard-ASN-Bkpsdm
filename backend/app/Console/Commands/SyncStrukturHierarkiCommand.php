<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncStrukturHierarkiCommand extends Command
{
    protected $signature = 'hierarki:sync';
    protected $description = 'Sync bezetting and kebutuhan in struktur_hierarki_opd from real klasifikasi_jabatan data';

    public function handle()
    {
        $this->info('Starting synchronization from klasifikasi_jabatan to struktur_hierarki_opd...');

        // Ambil semua unit kerja di struktur_hierarki_opd
        $hierarkis = DB::table('struktur_hierarki_opd')->get();
        $updatedCount = 0;

        foreach ($hierarkis as $h) {
            // Cari agregat dari klasifikasi_jabatan berdasarkan unit_kerja atau perangkat_daerah
            $agg = DB::table('klasifikasi_jabatan')
                ->where(function ($q) use ($h) {
                    $q->where('unit_kerja', $h->nama_unit_kerja)
                      ->orWhere('perangkat_daerah', $h->nama_unit_kerja);
                })
                ->selectRaw('SUM(bezetting) as total_bezetting, SUM(kebutuhan) as total_kebutuhan')
                ->first();

            if ($agg && ($agg->total_bezetting !== null || $agg->total_kebutuhan !== null)) {
                $bezetting = (int) ($agg->total_bezetting ?? 0);
                $kebutuhan = (int) ($agg->total_kebutuhan ?? 0);
                $selisih = $bezetting - $kebutuhan;

                DB::table('struktur_hierarki_opd')
                    ->where('id', $h->id)
                    ->update([
                        'bezetting' => $bezetting,
                        'kebutuhan' => $kebutuhan,
                        'selisih' => $selisih,
                    ]);

                $updatedCount++;
            }
        }

        $this->info("Successfully updated {$updatedCount} records in struktur_hierarki_opd with real data!");
        return 0;
    }
}
