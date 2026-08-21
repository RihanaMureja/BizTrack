<?php

namespace App\Enums;

enum NotificationType: string
{
    case LowStock = 'low_stock';
    case PaymentReceived = 'payment_received';
    case CreditReminder = 'credit_reminder';
    case DailySales = 'daily_sales';
    case BusinessApproved = 'business_approved';
    case StagnantProduct = 'stagnant_product';
    case TrialStarted = 'trial_started';
    case TrialExpiring = 'trial_expiring';
    case PlatformUserSignup = 'platform_user_signup';
    case PlatformEmailVerified = 'platform_email_verified';
    case PlatformBusinessProfileCreated = 'platform_business_profile_created';
    case PlatformOnboardingCompleted = 'platform_onboarding_completed';
    case PlatformPaymentCompleted = 'platform_payment_completed';
    case PlatformSubscriptionChanged = 'platform_subscription_changed';
    case PlatformSystemHealthCritical = 'platform_system_health_critical';
    case PlatformPaymentGatewayFailed = 'platform_payment_gateway_failed';
    case PlatformSupportMessage = 'platform_support_message';

    public function label(): string
    {
        return match ($this) {
            self::LowStock => 'Low stock',
            self::PaymentReceived => 'Payment received',
            self::CreditReminder => 'Credit reminder',
            self::DailySales => 'Daily sales',
            self::BusinessApproved => 'Business approved',
            self::StagnantProduct => 'Stagnant product',
            self::TrialStarted => 'Trial started',
            self::TrialExpiring => 'Trial expiring',
            self::PlatformUserSignup => 'Platform user signup',
            self::PlatformEmailVerified => 'Platform email verified',
            self::PlatformBusinessProfileCreated => 'Platform business profile created',
            self::PlatformOnboardingCompleted => 'Platform onboarding completed',
            self::PlatformPaymentCompleted => 'Platform payment completed',
            self::PlatformSubscriptionChanged => 'Platform subscription changed',
            self::PlatformSystemHealthCritical => 'Platform system health critical',
            self::PlatformPaymentGatewayFailed => 'Platform payment gateway failed',
            self::PlatformSupportMessage => 'Platform support message',
        };
    }
}
