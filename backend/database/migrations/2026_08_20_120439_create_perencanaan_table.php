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
        Schema::create('perencanaan', function (Blueprint $table) {
            $table->id();
            $table->string('opd');
            $table->string('jabatan');
            $table->string('status');
            $table->integer('kebutuhan');
            $table->string('estimasi_pengisian');
            $table->string('masa_jabatan_sebelumnya');
            $table->string('mulai_kosong');
            $table->string('kualifikasi');
            $table->string('kelas_jabatan');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perencanaan');
    }
};
