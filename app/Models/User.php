<?php

namespace App\Models;

use App\Enums\RecordStatus;
use App\Enums\BusinessPermissionKey;
use App\Enums\Role;
use App\Traits\HasRoles;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Role $role
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['business_id', 'business_role_id', 'first_name', 'last_name', 'name', 'email', 'phone', 'password', 'role', 'status', 'preferences', 'must_reset_password', 'password_changed_at', 'temporary_password_expires_at'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * @var list<string>
     */
    protected $appends = ['role_label'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'role' => Role::class,
            'status' => RecordStatus::class,
            'preferences' => 'array',
            'must_reset_password' => 'boolean',
            'password_changed_at' => 'datetime',
            'temporary_password_expires_at' => 'datetime',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function businessRole(): BelongsTo
    {
        return $this->belongsTo(BusinessRole::class);
    }

    public function ownedBusiness(): HasOne
    {
        return $this->hasOne(Business::class, 'owner_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function securityQuestions(): HasMany
    {
        return $this->hasMany(UserSecurityQuestion::class);
    }

    public function getRoleLabelAttribute(): string
    {
        return $this->businessRole?->name ?? $this->role->label();
    }

    public function hasBusinessPermission(string|\BackedEnum $permission): bool
    {
        if ($this->isSuperAdmin() || $this->isOwner()) {
            return true;
        }

        $permissionKey = $permission instanceof \BackedEnum ? (string) $permission->value : $permission;

        if ($this->isCashier() && ! $this->business_role_id) {
            return in_array($permissionKey, [
                BusinessPermissionKey::ViewDashboard->value,
                BusinessPermissionKey::ManageCustomers->value,
                BusinessPermissionKey::CreateSales->value,
                BusinessPermissionKey::ViewSales->value,
                BusinessPermissionKey::ManagePayments->value,
                BusinessPermissionKey::ViewNotifications->value,
            ], true);
        }

        return $this->businessRole?->permissions()
            ->where('key', $permissionKey)
            ->exists() ?? false;
    }
}
