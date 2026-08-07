<?php

namespace App\Services;

use App\Enums\BusinessAccessMode;
use App\Enums\BusinessVerificationDocumentType;
use App\Enums\RecordStatus;
use App\Events\BusinessRegistered;
use App\Models\Business;
use App\Models\BusinessVerificationDocument;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class BusinessService
{
    public function paginateForAdmin(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        return Business::query()
            ->with(['owner:id,first_name,last_name,email,role,status', 'subscription:id,name'])
            ->withCount(['users', 'products', 'sales'])
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(fn ($searchQuery) => $searchQuery
                ->where('business_name', 'like', '%'.$search.'%')
                ->orWhere('business_type', 'like', '%'.$search.'%')
                ->orWhere('email', 'like', '%'.$search.'%')
                ->orWhereHas('owner', fn ($ownerQuery) => $ownerQuery->where('email', 'like', '%'.$search.'%'))))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('access_mode', $status))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function upsertForOwner(User $owner, array $data): Business
    {
        return DB::transaction(function () use ($owner, $data): Business {
            $existingBusiness = $owner->ownedBusiness;
            $payload = collect($data)->except([
                'logo',
                'national_id_photo',
                'trade_license',
                'tin_certificate',
                'vat_certificate',
                'rental_agreement',
            ])->all();

            if (($data['logo'] ?? null) instanceof UploadedFile) {
                $payload['logo'] = $data['logo']->store('business-logos', 'public');
            }

            $documentPaths = [];

            foreach ([
                'national_id_photo' => 'national_id_photo_path',
                'trade_license' => 'trade_license_path',
                'tin_certificate' => 'tin_certificate_path',
                'vat_certificate' => 'vat_certificate_path',
                'rental_agreement' => 'rental_agreement_path',
            ] as $input => $column) {
                if (($data[$input] ?? null) instanceof UploadedFile) {
                    $payload[$column] = $data[$input]->store('business-verifications', 'public');
                    $documentPaths[$input] = $payload[$column];
                }
            }

            /** @var Business $business */
            $business = Business::updateOrCreate(
                ['owner_id' => $owner->id],
                [
                    ...$payload,
                    'owner_id' => $owner->id,
                    'email' => $payload['email'] ?? $owner->email,
                    'is_vat_registered' => (bool) ($payload['is_vat_registered'] ?? false),
                    'has_physical_shop' => (bool) ($payload['has_physical_shop'] ?? false),
                    'status' => $existingBusiness?->status ?? RecordStatus::Active,
                    'access_mode' => $existingBusiness?->access_mode ?? BusinessAccessMode::Onboarding,
                ],
            );

            $owner->forceFill(['business_id' => $business->id])->save();

            $this->syncOptionalDocuments($business, $owner, $documentPaths);

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

    public function assignSubscription(Business $business, int $subscriptionId): Business
    {
        $business->forceFill(['subscription_id' => $subscriptionId])->save();

        return $business->refresh();
    }

    /**
     * @param  array<string, string>  $paths
     */
    private function syncOptionalDocuments(Business $business, User $owner, array $paths): void
    {
        $types = [
            'national_id_photo' => BusinessVerificationDocumentType::NationalId,
            'trade_license' => BusinessVerificationDocumentType::TradeLicense,
            'tin_certificate' => BusinessVerificationDocumentType::TinCertificate,
            'vat_certificate' => BusinessVerificationDocumentType::VatCertificate,
            'rental_agreement' => BusinessVerificationDocumentType::RentalAgreement,
        ];

        foreach ($paths as $input => $path) {
            $type = $types[$input] ?? null;

            if (! $type) {
                continue;
            }

            BusinessVerificationDocument::query()->updateOrCreate(
                [
                    'business_id' => $business->id,
                    'type' => $type,
                ],
                [
                    'uploaded_by' => $owner->id,
                    'label' => $type->label(),
                    'path' => $path,
                    'status' => RecordStatus::Active,
                    'notes' => null,
                    'reviewed_at' => null,
                    'reviewed_by' => null,
                ],
            );
        }
    }
}
