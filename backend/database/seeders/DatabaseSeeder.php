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

        User::updateOrCreate(
            ['username' => 'admin_bkpsdm'],
            [
                'name' => 'Admin BKPSDM',
                'email' => 'admin@bkpsdm.com',
                'nip' => '198001012010011001',
                'password' => 'password123',
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['username' => 'user_bkpsdm'],
            [
                'name' => 'User BKPSDM',
                'email' => 'user@bkpsdm.com',
                'nip' => '198001012010011003',
                'password' => 'password123',
                'role' => 'umum',
            ]
        );
    }
}
