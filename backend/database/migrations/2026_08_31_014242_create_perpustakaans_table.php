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
        Schema::create('perpustakaans', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->string('nomor_dokumen')->nullable();
            $table->string('kategori'); // Regulasi, Modul Diklat, SOP Layanan, Jurnal, E-Book
            $table->string('penulis')->nullable();
            $table->string('penerbit')->nullable();
            $table->integer('tahun')->default(2024);
            $table->text('deskripsi')->nullable();
            $table->string('file_format')->default('PDF');
            $table->string('file_size')->default('1.5 MB');
            $table->integer('jumlah_halaman')->default(10);
            $table->integer('jumlah_unduh')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->string('cover_color')->default('blue');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perpustakaans');
    }
};
