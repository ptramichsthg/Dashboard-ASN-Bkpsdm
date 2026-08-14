<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\SatuanKerja;

class SatuanKerjaController extends Controller
{
    public function index()
    {
        return response()->json(SatuanKerja::all());
    }
}
