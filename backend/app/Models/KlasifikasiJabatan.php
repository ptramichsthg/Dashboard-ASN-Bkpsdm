<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KlasifikasiJabatan extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'klasifikasi_jabatan';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'no_urut',
        'perangkat_daerah',
        'jabatan',
        'unit_kerja',
        'kategori_anjab',
        'klasifikasi_utama',
        'subklasifikasi',
        'jenis_eselon',
        'kelompok_jf',
        'jenjang_jf',
        'bezetting',
        'kebutuhan',
        'selisih',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'no_urut' => 'integer',
        'bezetting' => 'integer',
        'kebutuhan' => 'integer',
        'selisih' => 'integer',
    ];
}
