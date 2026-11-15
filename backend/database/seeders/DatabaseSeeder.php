<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Super Administrator (Hak akses penuh termasuk kelola akun pengguna)
        User::updateOrCreate(
            ['username' => 'superadmin_bkpsdm'],
            [
                'name' => 'Super Administrator BKPSDM',
                'email' => 'superadmin@bkpsdm.com',
                'nip' => '198001012010011000',
                'password' => Hash::make('password123'),
                'role' => 'super_admin',
            ]
        );

        // 2. Administrator (Hak akses Dashboard, Profil ASN, Direktori Pegawai)
        User::updateOrCreate(
            ['username' => 'admin_bkpsdm'],
            [
                'name' => 'Admin BKPSDM',
                'email' => 'admin@bkpsdm.com',
                'nip' => '198001012010011001',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        // 3. User / Pegawai Biasa (Hak akses Dashboard Eksekutif ringkas)
        User::updateOrCreate(
            ['username' => 'user_bkpsdm'],
            [
                'name' => 'Pegawai ASN BKPSDM',
                'email' => 'user@bkpsdm.com',
                'nip' => '198001012010011003',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ]
        );
    }
}
