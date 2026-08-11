import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { SharedData } from '@/types';

function getBusinessInitials(name: string): string {
    const words = name.trim().split(/\s+/u).filter(Boolean);

    if (words.length === 0) {
        return '';
    }

    if (words.length === 1) {
        return Array.from(words[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }

    return `${Array.from(words[0])[0]}${Array.from(words[1])[0]}`.toUpperCase();
}

export function BusinessBranding() {
    const { auth } = usePage<SharedData>().props;
    const businessName = auth.user?.display_business_name ?? '';
    const logo = auth.user?.business_logo;
    const [failedLogo, setFailedLogo] = useState<string | null>(null);

    if (logo && logo !== failedLogo) {
        return (
            <img
                src={logo}
                alt={`${businessName} logo`}
                onError={() => setFailedLogo(logo)}
                className="h-11 w-auto max-w-40 rounded-lg object-contain object-left"
            />
        );
    }

    return (
        <Avatar className="size-11 shrink-0 rounded-full">
            <AvatarFallback className="rounded-full bg-primary text-base font-semibold text-primary-foreground">
                {getBusinessInitials(businessName) || '—'}
            </AvatarFallback>
        </Avatar>
    );
}
