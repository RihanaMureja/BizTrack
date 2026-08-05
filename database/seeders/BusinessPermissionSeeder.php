<?php

namespace Database\Seeders;

use App\Enums\BusinessPermissionKey;
use App\Models\BusinessPermission;
use Illuminate\Database\Seeder;

class BusinessPermissionSeeder extends Seeder
{
    public function run(): void
    {
        foreach (BusinessPermissionKey::cases() as $permission) {
            BusinessPermission::updateOrCreate(
                ['key' => $permission->value],
                [
                    'name' => $permission->label(),
                    'group' => $permission->group(),
                    'description' => 'Allows employee to '.$permission->label().'.',
                ],
            );
        }
    }
}
