import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    BadgeDollarSign,
    Boxes,
    CalendarClock,
    Layers,
    Lightbulb,
    ReceiptText,
    ShoppingCart,
    TrendingDown,
} from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { PageHeader } from '@/components/page-header/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDisplayDate } from '@/lib/date';

type HistoryPoint = {
    date: string;
    quantity: number;
    revenue: number;
};

type RecentSale = {
    id: number;
    invoice_number: string;
    sold_at: string;
    customer: string;
    quantity: number;
    unit_price: number;
    line_total: number;
};

type Batch = {
    id: number;
    batch_number: string;
    quantity: number;
    remaining_quantity: number;
    unit_cost: string;
    received_at: string;
    expires_at: string | null;
    notes: string | null;
};

type Props = {
    product: {
        id: number;
        name: string;
        barcode: string | null;
        category: string;
        status: string;
        buy_price: number;
        selling_price: number;
        reorder_level: number;
        stock_on_hand: number;
        low_stock: boolean;
    };
    summary: {
        units_sold: number;
        revenue: number;
        order_count: number;
        last_sold_at: string | null;
        days_since_last_sale: number | null;
    };
    history: HistoryPoint[];
    recent_sales: RecentSale[];
    open_insight: {
        id: number;
        days_without_sale: number;
        suggested_action: string;
        detected_at: string;
    } | null;
    batches: Batch[];
    inventoryId: number | null;
    backUrl: string;
};

const formatEtb = (value: number) => `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;

const EXPIRING_SOON_DAYS = 30;

type ExpiryStatus = 'expired' | 'expiring' | 'active' | 'none';

function expiryStatus(expiresAt: string | null): ExpiryStatus {
    if (!expiresAt) {
        return 'none';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiresAt);
    expiry.setHours(0, 0, 0, 0);

    const daysLeft = Math.round((expiry.getTime() - today.getTime()) / 86_400_000);

    if (daysLeft < 0) {
        return 'expired';
    }

    return daysLeft <= EXPIRING_SOON_DAYS ? 'expiring' : 'active';
}

function expiryBadge(expiresAt: string | null) {
    switch (expiryStatus(expiresAt)) {
        case 'expired':
            return <Badge variant="destructive">Expired</Badge>;
        case 'expiring':
            return <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 !text-amber-600 dark:!text-amber-400">Expiring soon</Badge>;
        case 'active':
            return <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400">Active</Badge>;
        default:
            return <Badge variant="secondary">No expiration date</Badge>;
    }
}

function Info({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium">{value}</dd>
        </div>
    );
}

const THIRTY_DAY_CUTOFF = new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10);

export default function ProductInsights({ product, summary, history, recent_sales, open_insight, batches, inventoryId, backUrl }: Props) {
    const lastThirtyDays = history.filter((point) => point.date >= THIRTY_DAY_CUTOFF);
    const soldRecently = summary.last_sold_at !== null;

    const stockStatusBadge =
        product.stock_on_hand <= 0 ? (
            <Badge variant="destructive">Out of stock</Badge>
        ) : product.low_stock ? (
            <Badge variant="secondary">Low stock</Badge>
        ) : (
            <Badge variant="default">Healthy</Badge>
        );

    const columns: DataTableColumn<RecentSale>[] = [
        { key: 'invoice_number', header: 'Invoice', render: (sale) => <span className="font-medium">{sale.invoice_number}</span> },
        { key: 'sold_at', header: 'Date', render: (sale) => new Date(sale.sold_at).toLocaleDateString() },
        { key: 'customer', header: 'Customer' },
        { key: 'quantity', header: 'Qty' },
        { key: 'line_total', header: 'Total', className: 'text-right', render: (sale) => formatEtb(sale.line_total) },
    ];

    const statCards = [
        { label: 'Units sold (all time)', value: summary.units_sold.toLocaleString(), icon: ShoppingCart },
        { label: 'Revenue (all time)', value: formatEtb(summary.revenue), icon: BadgeDollarSign },
        { label: 'Orders', value: summary.order_count.toLocaleString(), icon: ReceiptText },
        { label: 'Stock on hand', value: product.stock_on_hand.toLocaleString(), icon: Boxes },
    ];

    return (
        <>
            <Head title={`${product.name} - Insights`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <PageHeader
                    icon={Lightbulb}
                    title={product.name}
                    description={`${product.category} · ${product.barcode ?? 'No barcode'}`}
                    actions={
                        <>
                            <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>{product.status}</Badge>
                            <Button variant="outline" asChild>
                                <Link href={backUrl}>
                                    <ArrowLeft className="size-4" />
                                    Back to products
                                </Link>
                            </Button>
                        </>
                    }
                />

                <section className="grid gap-3 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Product information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                                <Info label="SKU / Barcode" value={product.barcode ?? 'No barcode'} />
                                <Info label="Category" value={product.category} />
                                <Info label="Status" value={<Badge variant={product.status === 'active' ? 'default' : 'secondary'}>{product.status}</Badge>} />
                                <Info label="Stock on hand" value={`${product.stock_on_hand.toLocaleString()} units`} />
                                <Info label="Buy price" value={formatEtb(product.buy_price)} />
                                <Info label="Selling price" value={formatEtb(product.selling_price)} />
                                <Info label="Reorder level" value={`${product.reorder_level.toLocaleString()} units`} />
                                <Info label="Stock status" value={stockStatusBadge} />
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                            <CardTitle className="text-base">Batches & expiration</CardTitle>
                            {inventoryId && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/inventory/${inventoryId}/batches`}>
                                        <Layers className="size-4" />
                                        View batches
                                    </Link>
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {batches.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                                    <CalendarClock className="size-6" />
                                    <p className="font-medium text-foreground">No expiration date</p>
                                    <p>No batches on record. Restock this product to start tracking expiry dates.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {batches.map((batch) => (
                                        <div key={batch.id} className="flex flex-col gap-2 rounded-md border p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0">
                                                <p className="font-mono text-xs font-medium">{batch.batch_number}</p>
                                                <p className="mt-1 text-muted-foreground">
                                                    {batch.remaining_quantity.toLocaleString()} of {batch.quantity.toLocaleString()} left · received {formatDisplayDate(batch.received_at)}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {batch.expires_at ? `Expiry ${formatDisplayDate(batch.expires_at)}` : 'No expiry set'}
                                                </span>
                                                {expiryBadge(batch.expires_at)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                <h2 className="text-base font-semibold">Product insights</h2>

                {!soldRecently && (
                    <Alert>
                        <Lightbulb />
                        <AlertTitle>No sales recorded yet</AlertTitle>
                        <AlertDescription>
                            This product has never been sold. Restock it and start selling to see movement trends here.
                        </AlertDescription>
                    </Alert>
                )}

                {product.low_stock && (
                    <Alert variant="destructive">
                        <AlertTriangle />
                        <AlertTitle>Low stock</AlertTitle>
                        <AlertDescription>
                            Only {product.stock_on_hand} units on hand. The reorder level for this product is {product.reorder_level}.
                        </AlertDescription>
                    </Alert>
                )}

                {open_insight && (
                    <Alert>
                        <TrendingDown />
                        <AlertTitle>Stagnant product</AlertTitle>
                        <AlertDescription>
                            No sale for {open_insight.days_without_sale} days. {open_insight.suggested_action}
                        </AlertDescription>
                    </Alert>
                )}

                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <div key={card.label} className="rounded-md border bg-card p-4 shadow-sm">
                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                <card.icon className="size-4" />
                                {card.label}
                            </p>
                            <p className="mt-1 text-2xl font-semibold">{card.value}</p>
                        </div>
                    ))}
                </section>

                <section className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border bg-card p-4 shadow-sm">
                        <p className="text-sm text-muted-foreground">Last sale</p>
                        <p className="mt-1 text-2xl font-semibold">
                            {summary.last_sold_at ? new Date(summary.last_sold_at).toLocaleDateString() : 'Never'}
                        </p>
                    </div>
                    <div className="rounded-md border bg-card p-4 shadow-sm">
                        <p className="text-sm text-muted-foreground">Days since last sale</p>
                        <p className="mt-1 text-2xl font-semibold">
                            {summary.days_since_last_sale !== null ? `${summary.days_since_last_sale} days` : '—'}
                        </p>
                    </div>
                </section>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Sales – last 30 days</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={lastThirtyDays} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(date: string) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        interval="preserveStartEnd"
                                        minTickGap={24}
                                    />
                                    <YAxis yAxisId="quantity" tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <YAxis yAxisId="revenue" orientation="right" tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ fontSize: 12 }}
                                        formatter={(value, name) => (name === 'Revenue' ? formatEtb(Number(value)) : value)}
                                        labelFormatter={(date) => new Date(String(date)).toLocaleDateString()}
                                    />
                                    <Legend />
                                    <Bar yAxisId="quantity" dataKey="quantity" name="Units sold" style={{ fill: 'var(--primary)' }} radius={[3, 3, 0, 0]} />
                                    <Line yAxisId="revenue" dataKey="revenue" name="Revenue" type="monotone" style={{ stroke: 'var(--chart-1)' }} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold">Recent sales of this product</h2>
                    <DataTable columns={columns} data={recent_sales} rowKey={(sale) => sale.id} emptyMessage="No completed sales for this product yet." />
                </section>
            </div>
        </>
    );
}

ProductInsights.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/products' },
        { title: 'Insights', href: '/products/insights' },
    ],
};
