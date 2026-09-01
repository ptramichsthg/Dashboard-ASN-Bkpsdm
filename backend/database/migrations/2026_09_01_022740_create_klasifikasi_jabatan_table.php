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
        Schema::create('klasifikasi_jabatan', function (Blueprint $table) {
            $table->id();
            $table->integer('no_urut')->comment('Nomor urut asli dari data sumber (boleh duplikat)');
            $table->string('perangkat_daerah', 150);
            $table->string('jabatan', 150);
            $table->string('unit_kerja', 150);
            $table->string('kategori_anjab', 20)->comment('STRUKTURAL, FUNGSIONAL, PELAKSANA');
            $table->string('klasifikasi_utama', 20)->comment('MANAJERIAL, NON MANAJERIAL');
            $table->string('subklasifikasi', 30)->comment('JPT Pratama, Administrator, Pengawas, Jabatan Fungsional, Jabatan Pelaksana');
            $table->string('jenis_eselon', 20)->nullable();
            $table->string('kelompok_jf', 30)->nullable()->comment('Fungsional Ahli, Fungsional Terampil');
            $table->string('jenjang_jf', 20)->nullable();
            $table->integer('bezetting')->default(0)->comment('Jumlah pegawai saat ini');
            $table->integer('kebutuhan')->default(0)->comment('Jumlah kebutuhan pegawai');
            $table->integer('selisih')->default(0)->comment('Bezetting dikurangi kebutuhan');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('klasifikasi_jabatan');
    }
};
