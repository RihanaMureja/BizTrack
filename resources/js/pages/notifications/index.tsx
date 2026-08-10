import { Head, router } from '@inertiajs/react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { PageHeader } from '@/components/page-header/page-header';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Notification = {
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
};
type NotificationType = { value: string; label: string };
type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Props = {
    notifications: Paginated<Notification>;
    unreadCount: number;
    types: NotificationType[];
    filters: { search: string | null; type: string | null; read: boolean | null };
};

export default function NotificationsIndex({ notifications, unreadCount, types, filters }: Props) {
    const applyFilters = (next: Record<string, string | boolean | null>) => {
        const params = {
            search: filters.search ?? '',
            type: filters.type ?? '',
            read: filters.read === null ? '' : String(filters.read),
            ...next,
        };
        router.get('/notifications', params, { preserveState: true, preserveScroll: true, replace: true });
    };

    const columns: DataTableColumn<Notification>[] = [
        {
            key: 'title',
            header: 'Notification',
            render: (notification) => (
                <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{notification.title}</p>
                        {!notification.is_read && <Badge>New</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                </div>
            ),
        },
        { key: 'type', header: 'Type', render: (notification) => <Badge variant="secondary">{notification.type}</Badge> },
        { key: 'created_at', header: 'Created' },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (notification) => notification.is_read ? (
                <span className="text-sm text-muted-foreground">Read</span>
            ) : (
                <Button type="button" variant="outline" size="sm" onClick={() => router.post(`/notifications/${notification.id}/read`, {}, { preserveScroll: true })}>
                    <Check className="size-4" />
                    Mark read
                </Button>
            ),
        },
    ];

    return (
        <>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <PageHeader
                    title="Notifications"
                    description="Review low stock alerts, payments, credit reminders, and daily summaries."
                    icon={Bell}
                    actions={(
                        <Button type="button" variant="outline" onClick={() => router.post('/notifications/mark-all-read', {}, { preserveScroll: true })} disabled={unreadCount === 0}>
                            <CheckCheck className="size-4" />
                            Mark all read
                        </Button>
                    )}
                />

                <div className="grid gap-3 rounded-md border bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_12rem_10rem]">
                    <SearchBox defaultValue={filters.search ?? ''} placeholder="Search notifications..." onSearch={(search) => applyFilters({ search })} />
                    <select value={filters.type ?? ''} onChange={(event) => applyFilters({ type: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                        <option value="">All types</option>
                        {types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                    <select value={filters.read === null ? '' : String(filters.read)} onChange={(event) => applyFilters({ read: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                        <option value="">All</option>
                        <option value="false">Unread</option>
                        <option value="true">Read</option>
                    </select>
                </div>

                <div className="rounded-md border bg-card p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Unread</p>
                            <p className="text-2xl font-semibold">{unreadCount}</p>
                        </div>
                        <Badge variant="secondary">{notifications.total} total</Badge>
                    </div>
                    <DataTable columns={columns} data={notifications.data} rowKey={(notification) => notification.id} emptyMessage="No notifications match the current filters." />
                    <div className="mt-4">
                        <Pagination links={notifications.links} from={notifications.from} to={notifications.to} total={notifications.total} />
                    </div>
                </div>
            </div>
        </>
    );
}

NotificationsIndex.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Notifications', href: '/notifications' }] };
