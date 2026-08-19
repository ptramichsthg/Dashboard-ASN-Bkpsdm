<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengembangan_kompetensi', function (Blueprint $table) {
            $table->id();
            $table->string('nip', 25);
            $table->string('nama_asn', 150);
            $table->string('satuan_kerja', 200);
            $table->string('nama_pelatihan', 200);
            $table->string('jenis_pelatihan', 50);
            $table->integer('jp');
            $table->string('bulan', 20);
            $table->integer('tahun');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengembangan_kompetensi');
    }
};
