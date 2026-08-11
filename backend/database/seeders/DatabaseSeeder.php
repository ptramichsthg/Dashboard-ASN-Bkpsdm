<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::create([
            'name' => 'Admin BKPSDM',
            'email' => 'admin@bkpsdm.com',
            'username' => 'admin_bkpsdm',
            'nip' => '198001012010011001',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);
    }
}
