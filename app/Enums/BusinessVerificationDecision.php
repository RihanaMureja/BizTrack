<?php

namespace App\Enums;

enum BusinessVerificationDecision: string
{
    case Approved = 'approved';
    case Rejected = 'rejected';
    case ResubmissionRequired = 'resubmission_required';
}
