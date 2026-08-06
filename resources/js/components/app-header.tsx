import { Link, usePage } from '@inertiajs/react';
import { Bell, Menu, Search } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { AppearanceToggleButton } from '@/components/appearance-toggle-button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, SharedData } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

export function AppHeader({ breadcrumbs = [] }: Props) {
    const {
        auth,
        navigation = [],
        notificationSummary,
    } = usePage<SharedData>().props;
    const getInitials = useInitials();

    return (
        <>
            <div className="border-b bg-background/90 backdrop-blur">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2"
                                >
                                    <Menu className="size-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation menu
                                </SheetTitle>
                                <SheetHeader className="border-b border-sidebar-border pb-4 text-left">
                                    <AppLogo />
                                </SheetHeader>
                                <nav className="grid gap-4 p-4">
                                    {navigation.map((group) => (
                                        <div key={group.label}>
                                            <p className="px-3 text-xs font-semibold tracking-wide text-muted-foreground/70 uppercase">
                                                {group.label}
                                            </p>
                                            <div className="mt-1 grid gap-1">
                                                {group.items.map((item) => (
                                                    <Link
                                                        key={item.title}
                                                        href={item.href}
                                                        className="rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent"
                                                    >
                                                        {item.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center"
                    >
                        <AppLogo />
                    </Link>

                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden md:inline-flex"
                        >
                            <Search className="size-5 opacity-70" />
                        </Button>
                        <AppearanceToggleButton />
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="relative"
                        >
                            <Link
                                href="/notifications"
                                aria-label="Notifications"
                            >
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
                                {auth.user && (
                                    <UserMenuContent user={auth.user} />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b bg-background/80">
                    <div className="mx-auto flex h-12 w-full items-center px-4 text-muted-foreground md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
