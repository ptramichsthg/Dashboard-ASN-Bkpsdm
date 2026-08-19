<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('layanans', function (Blueprint $table) {
            $table->id();
            $table->string('nip');
            $table->string('nama');
            $table->string('nomorSurat')->nullable();
            $table->string('layanan');
            $table->date('tanggalPengajuan')->nullable();
            $table->date('tanggalKirim')->nullable();
            $table->string('status')->default('Usulan'); // Selesai, Proses, Usulan
            $table->string('perangkatDaerah');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('layanans');
    }
};
