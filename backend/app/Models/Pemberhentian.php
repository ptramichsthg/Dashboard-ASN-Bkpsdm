<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pemberhentian extends Model
{
    protected $fillable = [
        'nip',
        'nama',
        'satuan_kerja',
        'jabatan',
        'golongan',
        'jenis_pemberhentian',
        'alasan',
        'tanggal_usulan',
        'tanggal_pemberhentian',
        'nomor_sk',
        'tanggal_sk',
        'status',
        'email_pegawai',
        'email_atasan',
        'catatan',
        'file_pendukung',
    ];

    protected $casts = [
        'tanggal_usulan' => 'date',
        'tanggal_pemberhentian' => 'date',
        'tanggal_sk' => 'date',
    ];

    // Accessor untuk format tanggal Indonesia
    public function getTanggalUsulanFormatAttribute()
    {
        return $this->tanggal_usulan ? $this->tanggal_usulan->format('d-m-Y') : '-';
    }

    public function getTanggalPemberhentianFormatAttribute()
    {
        return $this->tanggal_pemberhentian ? $this->tanggal_pemberhentian->format('d-m-Y') : '-';
    }

    public function getTanggalSkFormatAttribute()
    {
        return $this->tanggal_sk ? $this->tanggal_sk->format('d-m-Y') : '-';
    }

    // Scope untuk filter
    public function scopeByJenis($query, $jenis)
    {
        if ($jenis && $jenis !== 'Semua Jenis') {
            return $query->where('jenis_pemberhentian', $jenis);
        }
        return $query;
    }

    public function scopeByStatus($query, $status)
    {
        if ($status && $status !== 'Semua Status') {
            return $query->where('status', $status);
        }
        return $query;
    }

    public function scopeBySatker($query, $satker)
    {
        if ($satker && $satker !== 'Semua Satuan Kerja') {
            return $query->where('satuan_kerja', 'like', '%' . $satker . '%');
        }
        return $query;
    }

    public function scopeSearch($query, $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', '%' . $search . '%')
                  ->orWhere('nip', 'like', '%' . $search . '%');
            });
        }
        return $query;
    }

    // Helper untuk cek apakah perlu reminder
    public function needsReminder()
    {
        $today = now();
        $monthsUntilRetirement = $today->diffInMonths($this->tanggal_pemberhentian);
        
        // Reminder 3 bulan dan 1 bulan sebelum pemberhentian
        return in_array($monthsUntilRetirement, [3, 1]) && 
               in_array($this->status, ['Disetujui', 'SK Terbit']);
    }
}
