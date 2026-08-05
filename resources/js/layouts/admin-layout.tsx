import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ReactNode } from 'react';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
    children: ReactNode;
};

export default function AdminLayout({ breadcrumbs = [], children }: Props) {
    return <AppLayout breadcrumbs={breadcrumbs}>{children}</AppLayout>;
}
