<?php

namespace App\Services;

use App\Models\PhoneVerification;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class PhoneOtpService
{
    public function send(User $user, string $phone): string
    {
        $code = (string) random_int(100000, 999999);

        PhoneVerification::create([
            'user_id' => $user->id,
            'phone' => $phone,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(10),
        ]);

        return $code;
    }

    public function verify(User $user, string $phone, string $code): bool
    {
        $verification = PhoneVerification::query()
            ->where('user_id', $user->id)
            ->where('phone', $phone)
            ->whereNull('verified_at')
            ->latest()
            ->first();

        if (! $verification || $verification->expires_at->isPast()) {
            return false;
        }

        $verification->increment('attempts');

        if (! Hash::check($code, $verification->code_hash)) {
            return false;
        }

        $verification->forceFill(['verified_at' => now()])->save();
        $user->forceFill(['phone' => $phone])->save();

        return true;
    }
}
