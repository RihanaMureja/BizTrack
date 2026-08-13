import { usePage } from '@inertiajs/react';
import { useSidebar } from '@/components/ui/sidebar';

export default function AppLogo() {
    const { auth } = usePage<{ auth: { user: { business_logo?: string | null; display_business_name?: string | null } } }>().props;
    const { state: sidebarState } = useSidebar();

    const businessLogo = auth?.user?.business_logo;
    const businessName = auth?.user?.display_business_name || 'Business';

    // Generate initials from business name (e.g., "Merkato Fresh Mart" → "MF")
    const getInitials = (name: string): string => {
        const words = name.trim().split(/\s+/);
        if (words.length === 1) {
            return words[0].slice(0, 2).toUpperCase();
        }
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    };

    // When collapsed, show only the logo icon (no text)
    if (sidebarState === 'collapsed') {
        return businessLogo ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-sidebar-accent text-sidebar-accent-foreground">
                <img
                    src={businessLogo}
                    alt={businessName}
                    className="h-8 w-8 rounded-sm object-contain"
                />
            </div>
        ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                <span className="text-sm font-semibold">{getInitials(businessName)}</span>
            </div>
        );
    }

    // When expanded, show logo with business name and "Powered by Laravel"
    return (
        <div className="grid flex-1 text-left gap-1 min-w-0">
            <div className="relative flex items-center gap-2">
                {businessLogo ? (
                    <img
                        src={businessLogo}
                        alt={businessName}
                        className="h-10 w-auto max-w-[100px] rounded-sm object-contain object-left"
                    />
                ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                        <span className="text-sm font-semibold">{getInitials(businessName)}</span>
                    </div>
                )}
                <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="truncate text-sm font-semibold">{businessName}</div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        Powered by Laravel
                    </span>
                </div>
            </div>
        </div>
    );
}
