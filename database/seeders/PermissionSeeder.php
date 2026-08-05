<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        collect([
            'platform.manage',
            'businesses.manage',
            'users.manage',
            'subscriptions.manage',
            'audit_logs.view',
            'pos.operate',
        ])->each(fn (string $permission) => $this->command?->line($permission.' permission available.'));
    }
}
