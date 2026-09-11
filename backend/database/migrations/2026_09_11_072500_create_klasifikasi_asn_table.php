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
        if (!Schema::hasTable('klasifikasi_asn')) {
            Schema::create('klasifikasi_asn', function (Blueprint $table) {
                $table->increments('id');
                $table->string('nama_jabatan', 200);
                $table->enum('jenis_asn', ['PNS', 'PPPK', 'PPPK PW'])->index();
                $table->enum('kategori', ['Kesehatan', 'Pendidikan', 'Teknis'])->index();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('klasifikasi_asn');
    }
};
