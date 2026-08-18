import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';
import type { RouteDefinition } from '@/wayfinder';

export type AppLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export type AppVariant = 'header' | 'sidebar';

export type FlashToast = {
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
};

export type AuthLayoutProps = {
    children?: ReactNode;
    name?: string;
    title?: string;
    description?: string;
    backHref?: RouteDefinition<'get'> | string;
};
