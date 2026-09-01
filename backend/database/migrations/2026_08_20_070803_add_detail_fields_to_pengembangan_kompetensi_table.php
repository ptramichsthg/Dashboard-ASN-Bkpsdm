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
        Schema::table('pengembangan_kompetensi', function (Blueprint $table) {
            $table->string('bidang', 100)->nullable()->after('satuan_kerja');
            $table->date('tanggal')->nullable()->after('jenis_pelatihan');
            $table->string('penyelenggara', 150)->nullable()->after('tanggal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengembangan_kompetensi', function (Blueprint $table) {
            $table->dropColumn(['bidang', 'tanggal', 'penyelenggara']);
        });
    }
};
