<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Perpustakaan extends Model
{
    use HasFactory;

    protected $table = 'perpustakaans';

    protected $fillable = [
        'judul',
        'nomor_dokumen',
        'kategori',
        'penulis',
        'penerbit',
        'tahun',
        'deskripsi',
        'file_format',
        'file_size',
        'jumlah_halaman',
        'jumlah_unduh',
        'is_featured',
        'cover_color',
    ];

    protected $casts = [
        'tahun' => 'integer',
        'jumlah_halaman' => 'integer',
        'jumlah_unduh' => 'integer',
        'is_featured' => 'boolean',
    ];
}
