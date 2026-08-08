import { Head, router } from '@inertiajs/react';
import { BadgeDollarSign } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';

type Payment = {
    id: number;
    amount: string;
    method: string;
    status: string;
    reference: string | null;
    paid_at: string | null;
    verified_at: string | null;
    created_at: string | null;
    business: {
        id: number;
        business_name: string;
        subscription_status: string | null;
        owner: { first_name: string; last_name: string; email: string } | null;
    } | null;
    subscription: { id: number; name: string } | null;
    user: { first_name: string; last_name: string; email: string } | null;
};
type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};
type Props = {
    payments: Paginated<Payment>;
    statuses: Array<{ value: string; label: string }>;
    filters: { search: string | null; status: string | null };
};

const statusVariant = (status: string) => {
    if (status === 'paid') {
        return 'default';
    }

    if (status === 'pending') {
        return 'secondary';
    }

    if (status === 'cancelled') {
        return 'outline';
    }

    return 'destructive';
};

export default function AdminSubscriptionPaymentsIndex({
    payments,
    statuses,
    filters,
}: Props) {
    const applyFilters = (next: Record<string, string | null>) =>
        router.get(
            '/admin/subscription-payments',
            {
                search: filters.search ?? '',
                status: filters.status ?? '',
                ...next,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );

    const columns: DataTableColumn<Payment>[] = [
        {
            key: 'business',
            header: 'Business',
            render: (payment) => (
                <div>
                    <p className="font-medium">
                        {payment.business?.business_name ?? '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {payment.business?.owner?.email ?? '—'}
                    </p>
                </div>
            ),
        },
        {
            key: 'subscription',
            header: 'Plan',
            render: (payment) => payment.subscription?.name ?? '—',
        },
        {
            key: 'amount',
            header: 'Amount',
            render: (payment) =>
                `${Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB`,
        },
        {
            key: 'method',
            header: 'Method',
            render: (payment) => (
                <Badge variant="outline">{payment.method}</Badge>
            ),
        },
        {
            key: 'reference',
            header: 'Reference',
            render: (payment) => (
                <span className="font-mono text-xs">
                    {payment.reference ?? '—'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (payment) => (
                <Badge variant={statusVariant(payment.status)}>
                    {payment.status}
                </Badge>
            ),
        },
        {
            key: 'paid_at',
            header: 'Paid At',
            render: (payment) =>
                payment.paid_at
                    ? new Date(payment.paid_at).toLocaleString()
                    : '—',
        },
        {
            key: 'created_at',
            header: 'Created',
            render: (payment) =>
                payment.created_at
                    ? new Date(payment.created_at).toLocaleDateString()
                    : '—',
        },
    ];

    return (
        <>
            <Head title="Subscription Payments" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                        <BadgeDollarSign className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">
                            Subscription Payments
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            View all plan payments processed through Chapa.
                            Payments activate plans automatically.
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 rounded-md border bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_12rem]">
                    <SearchBox
                        defaultValue={filters.search ?? ''}
                        placeholder="Search business or owner email..."
                        onSearch={(search) => applyFilters({ search })}
                        className="relative w-full"
                    />
                    <select
                        value={filters.status ?? ''}
                        onChange={(event) =>
                            applyFilters({ status: event.target.value })
                        }
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="">All statuses</option>
                        {statuses.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>

                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <DataTable
                        columns={columns}
                        data={payments.data}
                        rowKey={(payment) => payment.id}
                        emptyMessage="No subscription payments match the current filters."
                    />
                    <div className="mt-4">
                        <Pagination
                            links={payments.links}
                            from={payments.from}
                            to={payments.to}
                            total={payments.total}
                        />
                    </div>
                </section>
            </div>
        </>
    );
}

AdminSubscriptionPaymentsIndex.layout = {
    breadcrumbs: [
        { title: 'Super Admin', href: '/admin' },
        {
            title: 'Subscription Payments',
            href: '/admin/subscription-payments',
        },
    ],
};
