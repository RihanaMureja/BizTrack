import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Lightbulb, XCircle } from 'lucide-react';
import { useMemo } from 'react';

type Insight = {
    id: number;
    status: string;
    days_without_sale: number;
    threshold_days: number;
    stock_on_hand: number;
    last_sold_at: string | null;
    suggested_action: string | null;
    type?: string;
    product: {
        name: string;
        barcode: string | null;
        expire_date?: string | null;
        category?: { name: string } | null;
        inventory?: { available_stock: number } | null;
    } | null;
} & Record<string, unknown>;
type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};
type Props = {
    stagnantInsights: Paginated<Insight>;
    expiringInsights: Paginated<Insight>;
    statuses: Array<{ value: string; label: string }>;
    preferences: {
        enabled: boolean;
        threshold_days: number;
        minimum_stock: number;
        frequency_days: number;
        expiry_alert_days: number;
        expiry_notification_frequency: number;
    };
    filters: {
        search: string | null;
        status: string | null;
        tab: string | null;
    };
};

const statusVariant = (status: string) =>
    status === 'open'
        ? 'outline'
        : status === 'resolved'
          ? 'default'
          : 'secondary';

export default function ProductInsights({
    stagnantInsights,
    expiringInsights,
    statuses,
    preferences,
    filters,
}: Props) {
    const activeTab = (filters.tab ?? 'stagnant') as 'stagnant' | 'expiring';
    const applyFilters = (next: Record<string, string | null>) =>
        router.get(
            '/products/insights',
            {
                tab: activeTab,
                search: filters.search ?? '',
                status: filters.status ?? '',
                ...next,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );

    const activeInsights = activeTab === 'expiring' ? expiringInsights : stagnantInsights;

    const columns = useMemo<DataTableColumn<Insight>[]>(() => {
        if (activeTab === 'expiring') {
            return [
                {
                    key: 'product',
                    header: 'Product',
                    render: (insight) => (
                        <div>
                            <p className="font-medium">
                                {insight.product?.name ?? 'Unknown product'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {insight.product?.barcode ??
                                    insight.product?.category?.name ??
                                    'No barcode'}
                            </p>
                        </div>
                    ),
                },
                {
                    key: 'days_without_sale',
                    header: 'Expires in',
                    render: (insight) => {
                        const days = insight.days_without_sale;
                        if (days < 0) {
                            return <span className="font-medium text-destructive">Expired {Math.abs(days)} day{Math.abs(days) === 1 ? '' : 's'} ago</span>;
                        }

                        return `${days} day${days === 1 ? '' : 's'}`;
                    },
                },
                {
                    key: 'expiry_date',
                    header: 'Expiry date',
                    render: (insight) =>
                        insight.product?.expire_date
                            ? new Date(insight.product.expire_date).toLocaleDateString()
                            : 'Not set',
                },
                {
                    key: 'stock_on_hand',
                    header: 'Stock',
                    render: (insight) => `${insight.stock_on_hand} on hand`,
                },
                {
                    key: 'status',
                    header: 'Status',
                    render: (insight) => (
                        <Badge
                            variant={
                                insight.days_without_sale < 0
                                    ? 'destructive'
                                    : 'outline'
                            }
                        >
                            {insight.days_without_sale < 0 ? 'Expired' : 'Expiring soon'}
                        </Badge>
                    ),
                },
                {
                    key: 'suggested_action',
                    header: 'Suggested action',
                    render: (insight) =>
                        insight.suggested_action ?? 'Review stock and prepare a plan.',
                },
                {
                    key: 'actions',
                    header: '',
                    className: 'text-right',
                    render: (insight) =>
                        insight.status === 'open' ? (
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.post(
                                            `/product-insights/${insight.id}/dismiss`,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    <XCircle className="size-4" /> Dismiss
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        router.post(
                                            `/product-insights/${insight.id}/resolve`,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    <CheckCircle2 className="size-4" /> Resolve
                                </Button>
                            </div>
                        ) : null,
                },
            ];
        }

        return [
            {
                key: 'product',
                header: 'Product',
                render: (insight) => (
                    <div>
                        <p className="font-medium">
                            {insight.product?.name ?? 'Unknown product'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {insight.product?.barcode ??
                                insight.product?.category?.name ??
                                'No barcode'}
                        </p>
                    </div>
                ),
            },
            {
                key: 'days_without_sale',
                header: 'No sale',
                render: (insight) => `${insight.days_without_sale} days`,
            },
            {
                key: 'stock_on_hand',
                header: 'Stock',
                render: (insight) => `${insight.stock_on_hand} on hand`,
            },
            {
                key: 'status',
                header: 'Status',
                render: (insight) => (
                    <Badge variant={statusVariant(insight.status)}>
                        {insight.status}
                    </Badge>
                ),
            },
            {
                key: 'suggested_action',
                header: 'Suggested action',
                render: (insight) =>
                    insight.suggested_action ?? 'Review pricing or promotion.',
            },
            {
                key: 'actions',
                header: '',
                className: 'text-right',
                render: (insight) =>
                    insight.status === 'open' ? (
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.post(
                                        `/product-insights/${insight.id}/dismiss`,
                                        {},
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                <XCircle className="size-4" /> Dismiss
                            </Button>
                            <Button
                                size="sm"
                                onClick={() =>
                                    router.post(
                                        `/product-insights/${insight.id}/resolve`,
                                        {},
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                <CheckCircle2 className="size-4" /> Resolve
                            </Button>
                        </div>
                    ) : null,
            },
        ];
    }, [activeTab]);

    const rowClassName = (insight: Insight) => {
        if (activeTab !== 'expiring') {
            return '';
        }

        return insight.days_without_sale < 0
            ? 'bg-red-50/80 dark:bg-red-950/20'
            : 'bg-amber-50/70 dark:bg-amber-950/20';
    };

    const headerCopy =
        activeTab === 'expiring'
            ? 'Find products approaching or past their expiry date.'
            : 'Find products that are sitting in stock without recent sales movement.';

    const summaryCards =
        activeTab === 'expiring'
            ? [
                { label: 'Expiry alert window', value: `${preferences.expiry_alert_days} days` },
                { label: 'Reminder frequency', value: `Every ${preferences.expiry_notification_frequency} days` },
            ]
            : [
                { label: 'Minimum stock', value: `${preferences.minimum_stock}` },
                { label: 'Reminder frequency', value: `Every ${preferences.frequency_days} days` },
            ];

    const tabButtonClass = (tab: 'stagnant' | 'expiring') =>
        activeTab === tab
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-background text-muted-foreground hover:bg-accent';

    const currentTitle = activeTab === 'expiring' ? 'Expiring products' : 'Stagnant products';

    return (
        <>
            <Head title="Product Insights" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <Lightbulb className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">
                                Product insights
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {headerCopy}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{preferences.threshold_days} day stagnant threshold</Badge>
                        <Badge variant="outline">{preferences.expiry_alert_days} day expiry alert</Badge>
                    </div>
                </div>

                <section className="grid gap-3 rounded-md border bg-card p-4 shadow-sm md:grid-cols-3">
                    <div>
                        <p className="text-sm text-muted-foreground">Alerts</p>
                        <p className="text-lg font-semibold">
                            {preferences.enabled ? 'Enabled' : 'Disabled'}
                        </p>
                    </div>
                    {summaryCards.map((item) => (
                        <div key={item.label}>
                            <p className="text-sm text-muted-foreground">
                                {item.label}
                            </p>
                            <p className="text-lg font-semibold">{item.value}</p>
                        </div>
                    ))}
                </section>

                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex rounded-lg border bg-background p-1">
                            <button
                                type="button"
                                onClick={() => applyFilters({ tab: 'stagnant' })}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${tabButtonClass('stagnant')}`}
                            >
                                Stagnant Products
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFilters({ tab: 'expiring' })}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${tabButtonClass('expiring')}`}
                            >
                                Expiring Products
                            </button>
                        </div>
                        <span className="text-sm text-muted-foreground">{currentTitle}</span>
                    </div>
                    <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
                        <SearchBox
                            defaultValue={filters.search ?? ''}
                            placeholder="Search product or barcode..."
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
                        <div className="h-10 rounded-md border border-dashed border-input px-3 text-sm leading-10 text-muted-foreground">
                            {activeTab === 'expiring' ? 'Expiry-focused view' : 'Sales-activity view'}
                        </div>
                    </div>
                    <DataTable
                        columns={columns}
                        data={activeInsights.data}
                        rowKey={(insight) => insight.id}
                        emptyMessage="No product movement insights match the current filters."
                        rowClassName={(insight) => rowClassName(insight)}
                    />
                    <div className="mt-4">
                        <Pagination
                            links={activeInsights.links}
                            from={activeInsights.from}
                            to={activeInsights.to}
                            total={activeInsights.total}
                        />
                    </div>
                </section>
            </div>
        </>
    );
}

ProductInsights.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Product Insights', href: '/products/insights' },
    ],
};
