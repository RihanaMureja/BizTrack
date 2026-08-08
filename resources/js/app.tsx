import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { useBrandColor } from '@/hooks/use-brand-color';
import AppLayout from '@/layouts/app-layout';
import AuthOnboardingLayout from '@/layouts/auth/auth-onboarding-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { DEFAULT_BRAND_COLOR, initializeBrandColor } from '@/lib/brand-color';

const appName = import.meta.env.VITE_APP_NAME || 'BizTrack';

function BrandColorProvider() {
    useBrandColor();

    return null;
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name === 'auth/business-setup' ||
                name === 'auth/subscription-select' ||
                name === 'auth/subscription-payment':
                return AuthOnboardingLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name === 'business/profile' || name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                <BrandColorProvider />
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color:
            (typeof document !== 'undefined'
                ? document.documentElement.getAttribute('data-brand-color')
                : null) || DEFAULT_BRAND_COLOR,
    },
});

// This will set light / dark mode on load...
initializeTheme();

// This will apply the business brand color on load...
initializeBrandColor();
