import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    BadgeDollarSign,
    Boxes,
    Lightbulb,
    ReceiptText,
    ShoppingCart,
    TrendingDown,
} from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    backUrl: string;
};

const formatEtb = (value: number) => `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;

const THIRTY_DAY_CUTOFF = new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10);

export default function ProductInsights({ product, summary, history, recent_sales, open_insight, backUrl }: Props) {
    const lastThirtyDays = history.filter((point) => point.date >= THIRTY_DAY_CUTOFF);
    const soldRecently = summary.last_sold_at !== null;

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
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <Lightbulb className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">{product.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                {product.category} · {product.barcode ?? 'No barcode'}
                            </p>
                        </div>
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>{product.status}</Badge>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={backUrl}>
                            <ArrowLeft className="size-4" />
                            Back to products
                        </Link>
                    </Button>
                </div>

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
