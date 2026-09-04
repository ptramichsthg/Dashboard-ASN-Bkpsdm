<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pemberhentians', function (Blueprint $table) {
            $table->id();
            $table->string('nip', 25);
            $table->string('nama');
            $table->string('satuan_kerja');
            $table->string('jabatan');
            $table->string('golongan', 10);
            $table->enum('jenis_pemberhentian', [
                'Pensiun BUP',
                'Pensiun APS',
                'Mengundurkan Diri',
                'Meninggal Dunia',
                'Diberhentikan'
            ]);
            $table->text('alasan');
            $table->date('tanggal_usulan');
            $table->date('tanggal_pemberhentian');
            $table->string('nomor_sk', 100)->nullable();
            $table->date('tanggal_sk')->nullable();
            $table->enum('status', [
                'Usulan',
                'Proses Verifikasi',
                'Disetujui',
                'SK Terbit',
                'Selesai',
                'Ditolak'
            ])->default('Usulan');
            $table->string('email_pegawai')->nullable();
            $table->string('email_atasan')->nullable();
            $table->text('catatan')->nullable();
            $table->string('file_pendukung')->nullable();
            $table->timestamps();

            // Indexes for better query performance
            $table->index('nip');
            $table->index('jenis_pemberhentian');
            $table->index('status');
            $table->index('tanggal_pemberhentian');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemberhentians');
    }
};
