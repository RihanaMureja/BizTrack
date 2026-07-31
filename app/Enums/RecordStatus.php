<?php

namespace App\Enums;

enum RecordStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case PendingReview = 'pending_review';
    case Rejected = 'rejected';
    case ResubmissionRequired = 'resubmission_required';
    case Suspended = 'suspended';
}
