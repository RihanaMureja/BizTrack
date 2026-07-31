<?php

namespace App\Services;

use App\Enums\BusinessVerificationDecision;
use App\Enums\BusinessVerificationDocumentType;
use App\Enums\RecordStatus;
use App\Models\Business;
use App\Models\BusinessVerificationReview;
use App\Models\User;
use App\Notifications\BusinessApprovedNotification;
use App\Notifications\BusinessVerificationRejectedNotification;
use App\Notifications\BusinessVerificationResubmissionRequestedNotification;
use Illuminate\Support\Facades\DB;

class BusinessVerificationService
{
    public function __construct(private readonly AuditLogService $auditLogService) {}

    /**
     * @param  array<string, string|null>  $documentPaths
     */
    public function syncSubmittedDocuments(Business $business, User $owner, array $documentPaths): void
    {
        foreach ($this->documentTypes() as $column => $type) {
            $path = $documentPaths[$column] ?? null;

            if (! $path) {
                continue;
            }

            $business->verificationDocuments()->updateOrCreate(
                ['type' => $type->value],
                [
                    'uploaded_by' => $owner->id,
                    'label' => $type->label(),
                    'path' => $path,
                    'status' => RecordStatus::PendingReview->value,
                    'notes' => null,
                    'reviewed_at' => null,
                    'reviewed_by' => null,
                ],
            );
        }
    }

    public function approve(Business $business, User $reviewer, ?string $reason = null): Business
    {
        return $this->review($business, $reviewer, BusinessVerificationDecision::Approved, RecordStatus::Active, $reason);
    }

    public function reject(Business $business, User $reviewer, string $reason): Business
    {
        return $this->review($business, $reviewer, BusinessVerificationDecision::Rejected, RecordStatus::Rejected, $reason);
    }

    public function requestResubmission(Business $business, User $reviewer, string $reason): Business
    {
        return $this->review($business, $reviewer, BusinessVerificationDecision::ResubmissionRequired, RecordStatus::ResubmissionRequired, $reason);
    }

    private function review(Business $business, User $reviewer, BusinessVerificationDecision $decision, RecordStatus $statusAfter, ?string $reason): Business
    {
        return DB::transaction(function () use ($business, $reviewer, $decision, $statusAfter, $reason): Business {
            $business = Business::query()->whereKey($business->id)->lockForUpdate()->firstOrFail();
            $statusBefore = $business->status;

            $business->forceFill(['status' => $statusAfter])->save();

            /** @var BusinessVerificationReview $review */
            $review = $business->verificationReviews()->create([
                'reviewed_by' => $reviewer->id,
                'decision' => $decision->value,
                'reason' => $reason,
                'status_before' => $statusBefore?->value,
                'status_after' => $statusAfter->value,
                'reviewed_at' => now(),
            ]);

            $business->verificationDocuments()->update([
                'status' => $statusAfter->value,
                'notes' => $reason,
                'reviewed_at' => now(),
                'reviewed_by' => $reviewer->id,
            ]);

            match ($decision) {
                BusinessVerificationDecision::Approved => $business->owner?->notify(new BusinessApprovedNotification($business)),
                BusinessVerificationDecision::Rejected => $business->owner?->notify(new BusinessVerificationRejectedNotification($business, $reason ?? 'Verification was rejected.')),
                BusinessVerificationDecision::ResubmissionRequired => $business->owner?->notify(new BusinessVerificationResubmissionRequestedNotification($business, $reason ?? 'Please update your verification documents.')),
            };

            $this->auditLogService->log(
                action: 'business.verification.'.$decision->value,
                auditable: $review,
                business: $business,
                oldValues: ['status' => $statusBefore],
                newValues: ['status' => $statusAfter, 'reason' => $reason],
                user: $reviewer,
            );

            return $business->refresh();
        });
    }

    /**
     * @return array<string, BusinessVerificationDocumentType>
     */
    private function documentTypes(): array
    {
        return [
            'national_id_photo_path' => BusinessVerificationDocumentType::NationalId,
            'trade_license_path' => BusinessVerificationDocumentType::TradeLicense,
            'tin_certificate_path' => BusinessVerificationDocumentType::TinCertificate,
            'vat_certificate_path' => BusinessVerificationDocumentType::VatCertificate,
            'rental_agreement_path' => BusinessVerificationDocumentType::RentalAgreement,
        ];
    }
}
