<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\SatuanKerja;
use App\Models\StrukturHierarkiOpd;

class SatuanKerjaController extends Controller
{
    public function index()
    {
        return response()->json(SatuanKerja::all());
    }

    public function strukturHierarki()
    {
        return response()->json(StrukturHierarkiOpd::all());
    }
}

