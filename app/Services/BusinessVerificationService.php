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
use Illuminate\Support\Facades\Storage;

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

    /**
     * @param  array<int, array<string, mixed>>  $documentReviews
     */
    public function approve(Business $business, User $reviewer, ?string $reason = null, array $documentReviews = []): Business
    {
        return $this->review($business, $reviewer, BusinessVerificationDecision::Approved, RecordStatus::Active, $reason, $documentReviews);
    }

    /**
     * @param  array<int, array<string, mixed>>  $documentReviews
     */
    public function reject(Business $business, User $reviewer, string $reason, array $documentReviews = []): Business
    {
        return $this->review($business, $reviewer, BusinessVerificationDecision::Rejected, RecordStatus::Rejected, $reason, $documentReviews);
    }

    /**
     * @param  array<int, array<string, mixed>>  $documentReviews
     */
    public function requestResubmission(Business $business, User $reviewer, string $reason, array $documentReviews = []): Business
    {
        return $this->review($business, $reviewer, BusinessVerificationDecision::ResubmissionRequired, RecordStatus::ResubmissionRequired, $reason, $documentReviews);
    }

    /**
     * @param  array<int, array<string, mixed>>  $documentReviews
     */
    private function review(Business $business, User $reviewer, BusinessVerificationDecision $decision, RecordStatus $statusAfter, ?string $reason, array $documentReviews): Business
    {
        return DB::transaction(function () use ($business, $reviewer, $decision, $statusAfter, $reason, $documentReviews): Business {
            $business = Business::query()->whereKey($business->id)->lockForUpdate()->firstOrFail();
            $business->load('verificationDocuments');
            $statusBefore = $business->status;
            $documentReviewSnapshot = $this->normalizeDocumentReviews($business, $documentReviews);

            $business->forceFill(['status' => $statusAfter])->save();

            /** @var BusinessVerificationReview $review */
            $review = $business->verificationReviews()->create([
                'reviewed_by' => $reviewer->id,
                'decision' => $decision->value,
                'reason' => $reason,
                'document_reviews' => $documentReviewSnapshot,
                'status_before' => $statusBefore?->value,
                'status_after' => $statusAfter->value,
                'reviewed_at' => now(),
            ]);

            if ($decision === BusinessVerificationDecision::Approved) {
                foreach ($documentReviewSnapshot as $documentReview) {
                    $business->verificationDocuments()
                        ->whereKey($documentReview['document_id'])
                        ->update([
                            'status' => RecordStatus::Active->value,
                            'notes' => $documentReview['notes'],
                            'reviewed_at' => now(),
                            'reviewed_by' => $reviewer->id,
                        ]);
                }
            } else {
                foreach ($documentReviewSnapshot as $documentReview) {
                    $business->verificationDocuments()
                        ->whereKey($documentReview['document_id'])
                        ->update([
                            'status' => $documentReview['decision'],
                            'notes' => $documentReview['notes'],
                            'reviewed_at' => now(),
                            'reviewed_by' => $reviewer->id,
                        ]);
                }
                $this->deleteSubmittedDocuments($business);
            }

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
                newValues: ['status' => $statusAfter, 'reason' => $reason, 'document_reviews' => $documentReviewSnapshot],
                user: $reviewer,
            );

            return $business->refresh();
        });
    }

    /**
     * @param  array<int, array<string, mixed>>  $documentReviews
     * @return array<int, array<string, mixed>>
     */
    private function normalizeDocumentReviews(Business $business, array $documentReviews): array
    {
        $reviewsByDocument = collect($documentReviews)->keyBy(fn (array $review): int => (int) $review['document_id']);

        return $business->verificationDocuments
            ->map(function ($document) use ($reviewsByDocument): array {
                $review = $reviewsByDocument->get($document->id, []);

                return [
                    'document_id' => $document->id,
                    'type' => $document->type?->value ?? (string) $document->type,
                    'label' => $document->label,
                    'decision' => $review['decision'] ?? BusinessVerificationDecision::Approved->value,
                    'notes' => $review['notes'] ?? null,
                ];
            })
            ->values()
            ->all();
    }

    private function deleteSubmittedDocuments(Business $business): void
    {
        $documents = $business->verificationDocuments()->get();

        foreach ($documents as $document) {
            Storage::disk('public')->delete($document->path);
        }

        $business->verificationDocuments()->delete();

        $business->forceFill([
            'national_id_photo_path' => null,
            'trade_license_path' => null,
            'tin_certificate_path' => null,
            'vat_certificate_path' => null,
            'rental_agreement_path' => null,
            'submitted_for_review_at' => null,
        ])->save();
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
