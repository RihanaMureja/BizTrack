<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class PasswordSecurityService
{
    public function setPermanentPassword(User $user, string $password): User
    {
        $user->forceFill([
            'password' => Hash::make($password),
            'must_reset_password' => false,
            'password_changed_at' => now(),
            'temporary_password_expires_at' => null,
        ])->save();

        return $user->refresh();
    }

    public function setTemporaryPassword(User $user, string $password, int $validDays = 7): User
    {
        $user->forceFill([
            'password' => Hash::make($password),
            'must_reset_password' => true,
            'password_changed_at' => null,
            'temporary_password_expires_at' => now()->addDays($validDays),
        ])->save();

        return $user->refresh();
    }
}
