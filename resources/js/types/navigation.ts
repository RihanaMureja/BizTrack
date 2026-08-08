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

export type ServerNavGroup = {
    label: string;
    items: ServerNavItem[];
};

export type NavGroup = {
    label: string;
    items: NavItem[];
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
    brandColor?: string | null;
    navigation: ServerNavGroup[];
    notificationSummary: {
        unreadCount: number;
        recent: SharedNotification[];
    };
    sidebarOpen: boolean;
};
