import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Lightbulb, XCircle } from 'lucide-react';

type Insight = {
    id: number;
    status: string;
    days_without_sale: number;
    threshold_days: number;
    stock_on_hand: number;
    last_sold_at: string | null;
    suggested_action: string | null;
    product: {
        name: string;
        barcode: string | null;
        category?: { name: string } | null;
        inventory?: { available_stock: number } | null;
    } | null;
} & Record<string, unknown>;
type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Props = {
    insights: Paginated<Insight>;
    statuses: Array<{ value: string; label: string }>;
    preferences: { enabled: boolean; threshold_days: number; minimum_stock: number; frequency_days: number };
    filters: { search: string | null; status: string | null };
};

const statusVariant = (status: string) => status === 'open' ? 'outline' : status === 'resolved' ? 'default' : 'secondary';

export default function ProductInsights({ insights, statuses, preferences, filters }: Props) {
    const applyFilters = (next: Record<string, string | null>) => router.get('/products/insights', {
        search: filters.search ?? '',
        status: filters.status ?? '',
        ...next,
    }, { preserveState: true, preserveScroll: true, replace: true });

    const columns: DataTableColumn<Insight>[] = [
        {
            key: 'product',
            header: 'Product',
            render: (insight) => (
                <div>
                    <p className="font-medium">{insight.product?.name ?? 'Unknown product'}</p>
                    <p className="text-xs text-muted-foreground">{insight.product?.barcode ?? insight.product?.category?.name ?? 'No barcode'}</p>
                </div>
            ),
        },
        { key: 'days_without_sale', header: 'No sale', render: (insight) => `${insight.days_without_sale} days` },
        { key: 'stock_on_hand', header: 'Stock', render: (insight) => `${insight.stock_on_hand} on hand` },
        { key: 'status', header: 'Status', render: (insight) => <Badge variant={statusVariant(insight.status)}>{insight.status}</Badge> },
        { key: 'suggested_action', header: 'Suggested action', render: (insight) => insight.suggested_action ?? 'Review pricing or promotion.' },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (insight) => insight.status === 'open' ? (
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.post(`/product-insights/${insight.id}/dismiss`, {}, { preserveScroll: true })}>
                        <XCircle className="size-4" /> Dismiss
                    </Button>
                    <Button size="sm" onClick={() => router.post(`/product-insights/${insight.id}/resolve`, {}, { preserveScroll: true })}>
                        <CheckCircle2 className="size-4" /> Resolve
                    </Button>
                </div>
            ) : null,
        },
    ];

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
                            <h1 className="text-xl font-semibold">Product insights</h1>
                            <p className="text-sm text-muted-foreground">Find products that are sitting in stock without recent sales movement.</p>
                        </div>
                    </div>
                    <Badge variant={preferences.enabled ? 'default' : 'secondary'}>{preferences.threshold_days} day threshold</Badge>
                </div>

                <section className="grid gap-3 rounded-md border bg-card p-4 shadow-sm md:grid-cols-3">
                    <div>
                        <p className="text-sm text-muted-foreground">Alerts</p>
                        <p className="text-lg font-semibold">{preferences.enabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Minimum stock</p>
                        <p className="text-lg font-semibold">{preferences.minimum_stock}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Reminder frequency</p>
                        <p className="text-lg font-semibold">Every {preferences.frequency_days} days</p>
                    </div>
                </section>

                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem]">
                        <SearchBox defaultValue={filters.search ?? ''} placeholder="Search product or barcode..." onSearch={(search) => applyFilters({ search })} className="relative w-full" />
                        <select value={filters.status ?? ''} onChange={(event) => applyFilters({ status: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                            <option value="">All statuses</option>
                            {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                        </select>
                    </div>
                    <DataTable columns={columns} data={insights.data} rowKey={(insight) => insight.id} emptyMessage="No product movement insights match the current filters." />
                    <div className="mt-4"><Pagination links={insights.links} from={insights.from} to={insights.to} total={insights.total} /></div>
                </section>
            </div>
        </>
    );
}

ProductInsights.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Product Insights', href: '/products/insights' }] };
