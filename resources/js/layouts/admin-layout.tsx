import type { ReactNode } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
    children: ReactNode;
};

export default function AdminLayout({ breadcrumbs = [], children }: Props) {
    return <AppLayout breadcrumbs={breadcrumbs}>{children}</AppLayout>;
}
