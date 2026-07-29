import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Head, router } from '@inertiajs/react';
import { ScrollText } from 'lucide-react';

type AuditLog = {
    id: number;
    action: string;
    table_name: string | null;
    record_id: number | null;
    ip_address: string | null;
    created_at: string;
    business: { business_name: string } | null;
    user: { first_name: string | null; last_name: string | null; email: string } | null;
};

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    auditLogs: Paginated<AuditLog>;
    actions: string[];
    filters: {
        search: string | null;
        action: string | null;
        date_from: string | null;
        date_to: string | null;
    };
};

export default function AuditLogsIndex({ auditLogs, actions, filters }: Props) {
    const applyFilters = (next: Partial<Props['filters']>) => {
        router.get(
            '/admin/audit-logs',
            {
                search: filters.search ?? '',
                action: filters.action ?? '',
                date_from: filters.date_from ?? '',
                date_to: filters.date_to ?? '',
                ...next,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const columns: DataTableColumn<AuditLog>[] = [
        {
            key: 'action',
            header: 'Activity',
            render: (log) => (
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{log.action}</p>
                        {log.table_name && <Badge variant="secondary">{log.table_name}</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Record {log.record_id ?? 'n/a'} · {log.ip_address ?? 'No IP captured'}
                    </p>
                </div>
            ),
        },
        {
            key: 'user',
            header: 'User',
            render: (log) => {
                const name = [log.user?.first_name, log.user?.last_name].filter(Boolean).join(' ');

                return (
                    <div>
                        <p className="font-medium">{name || 'System'}</p>
                        {log.user?.email && <p className="text-xs text-muted-foreground">{log.user.email}</p>}
                    </div>
                );
            },
        },
        {
            key: 'business',
            header: 'Business',
            render: (log) => log.business?.business_name ?? 'Platform',
        },
        { key: 'created_at', header: 'Created' },
    ];

    return (
        <>
            <Head title="Audit Logs" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <ScrollText className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">Audit Logs</h1>
                            <p className="text-sm text-muted-foreground">
                                Track important sign-ins, sales, payments, products, expenses, and system changes.
                            </p>
                        </div>
                    </div>
                    <Badge variant="secondary">{auditLogs.total} records</Badge>
                </div>

                <div className="grid gap-3 rounded-md border bg-card p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_14rem_10rem_10rem]">
                    <SearchBox
                        defaultValue={filters.search ?? ''}
                        placeholder="Search users, businesses, actions..."
                        onSearch={(search) => applyFilters({ search })}
                        className="relative w-full"
                    />
                    <select
                        value={filters.action ?? ''}
                        onChange={(event) => applyFilters({ action: event.target.value })}
                        className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                    >
                        <option value="">All actions</option>
                        {actions.map((action) => (
                            <option key={action} value={action}>
                                {action}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={filters.date_from ?? ''}
                        onChange={(event) => applyFilters({ date_from: event.target.value })}
                        className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                    />
                    <input
                        type="date"
                        value={filters.date_to ?? ''}
                        onChange={(event) => applyFilters({ date_to: event.target.value })}
                        className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                    />
                </div>

                <div className="rounded-md border bg-card p-4 shadow-sm">
                    <DataTable
                        columns={columns}
                        data={auditLogs.data}
                        rowKey={(log) => log.id}
                        emptyMessage="No audit logs match the current filters."
                    />
                    <div className="mt-4">
                        <Pagination links={auditLogs.links} from={auditLogs.from} to={auditLogs.to} total={auditLogs.total} />
                    </div>
                </div>
            </div>
        </>
    );
}

AuditLogsIndex.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Audit Logs', href: '/admin/audit-logs' }] };
