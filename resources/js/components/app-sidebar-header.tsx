import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import type { BreadcrumbItem as BreadcrumbItemType, SharedData } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { notificationSummary } = usePage<SharedData>().props;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-6 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <Button variant="ghost" size="icon" asChild className="relative">
                <Link href="/notifications" aria-label="Notifications">
                    <Bell className="size-5" />
                    {notificationSummary.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                            {notificationSummary.unreadCount > 99 ? '99+' : notificationSummary.unreadCount}
                        </span>
                    )}
                </Link>
            </Button>
        </header>
    );
}
