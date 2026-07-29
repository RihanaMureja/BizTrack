<?php

namespace Database\Seeders;

use App\Enums\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        collect(Role::cases())->each(fn (Role $role) => $this->command?->line($role->label().' role available.'));
    }
}
