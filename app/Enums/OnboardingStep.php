<?php

namespace App\Enums;

enum OnboardingStep: string
{
    case BusinessProfile = 'business_profile';
    case VerifyPhone = 'verify_phone';
    case ChoosePlan = 'choose_plan';
    case Complete = 'complete';
}
