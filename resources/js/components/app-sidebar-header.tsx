import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { AppearanceToggleButton } from '@/components/appearance-toggle-button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import type { BreadcrumbItem as BreadcrumbItemType, SharedData } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth, notificationSummary } = usePage<SharedData>().props;
    const getInitials = useInitials();

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-6 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-1">
                <AppearanceToggleButton />
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="relative"
                >
                    <Link href="/notifications" aria-label="Notifications">
                        <Bell className="size-5" />
                        {notificationSummary.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                                {notificationSummary.unreadCount > 99
                                    ? '99+'
                                    : notificationSummary.unreadCount}
                            </span>
                        )}
                    </Link>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="size-10 rounded-md p-1"
                            aria-label="Account menu"
                        >
                            <Avatar className="size-8 overflow-hidden rounded-md">
                                <AvatarImage
                                    src={auth.user?.avatar}
                                    alt={auth.user?.name}
                                />
                                <AvatarFallback className="rounded-md bg-primary text-primary-foreground">
                                    {getInitials(auth.user?.name ?? '')}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        {auth.user && <UserMenuContent user={auth.user} />}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
