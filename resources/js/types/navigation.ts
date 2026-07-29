import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import type { Auth } from './auth';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
};

export type ServerNavItem = {
    title: string;
    href: string;
    icon: string;
};

export type SharedNotification = {
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
};

export type SharedData = {
    name: string;
    auth: Auth;
    navigation: ServerNavItem[];
    notificationSummary: {
        unreadCount: number;
        recent: SharedNotification[];
    };
    sidebarOpen: boolean;
};
