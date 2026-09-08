<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\SatuanKerja;
use App\Models\StrukturHierarkiOpd;

class SatuanKerjaController extends Controller
{
    public function index()
    {
        $staticMap = config('satker_map') ?? [];
        $reverseMap = array_flip($staticMap);

        $satuanKerja = SatuanKerja::all()->map(function ($item) use ($reverseMap) {
            $key = strtoupper(trim($item->satuan_kerja));
            if (isset($reverseMap[$key])) {
                $item->id = $reverseMap[$key];
            }
            return $item;
        });

        return response()->json($satuanKerja);
    }

    public function strukturHierarki()
    {
        return response()->json(StrukturHierarkiOpd::all());
    }
}

