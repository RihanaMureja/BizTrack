<?php

namespace App\Services;

use App\Enums\RecordStatus;
use App\Events\BusinessRegistered;
use App\Models\Business;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class BusinessService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function upsertForOwner(User $owner, array $data): Business
    {
        return DB::transaction(function () use ($owner, $data): Business {
            $existingBusiness = $owner->ownedBusiness;
            $payload = Arr::except($data, ['logo']);

            if (($data['logo'] ?? null) instanceof UploadedFile) {
                $payload['logo'] = $data['logo']->store('business-logos', 'public');
            }

            /** @var Business $business */
            $business = Business::updateOrCreate(
                ['owner_id' => $owner->id],
                [
                    ...$payload,
                    'owner_id' => $owner->id,
                    'email' => $payload['email'] ?? $owner->email,
                    'status' => $payload['status'] ?? RecordStatus::Active,
                ],
            );

            $owner->forceFill(['business_id' => $business->id])->save();

            if (! $existingBusiness) {
                BusinessRegistered::dispatch($business->refresh());
            }

            return $business->refresh();
        });
    }

    public function activate(Business $business): Business
    {
        $business->forceFill(['status' => RecordStatus::Active])->save();

        return $business->refresh();
    }

    public function deactivate(Business $business): Business
    {
        $business->forceFill(['status' => RecordStatus::Inactive])->save();

        return $business->refresh();
    }
}
