import { RevenueOverview } from '@/components/charts/revenue-overview';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, router, useForm } from '@inertiajs/react';
import { BarChart3, Download, FileText, Save } from 'lucide-react';
import type { FormEvent } from 'react';

type SummaryPoint = { label: string; value: string };
type ChartPoint = { label: string; value: number };
type ReportRow = Record<string, string | number | null>;
type ReportType = { value: string; label: string };
type RecentReport = {
    id: number;
    type: string;
    title: string;
    date_from: string | null;
    date_to: string | null;
    generated_at: string;
};
type Props = {
    report: {
        type: string;
        title: string;
        date_from: string;
        date_to: string;
        summary: SummaryPoint[];
        chart: ChartPoint[];
        rows: ReportRow[];
        topProducts?: Array<{ name: string; quantity: number; total: number }>;
        product?: {
            name: string;
            category: string;
            current_stock: number;
        } | null;
    };
    recentReports: RecentReport[];
    types: ReportType[];
    filters: {
        type: string;
        date_from: string;
        date_to: string;
        product_id?: string | number | null;
    };
    products?: Array<{ id: number; name: string }>;
};

export default function ReportsIndex({
    report,
    recentReports,
    types,
    filters,
    products = [],
}: Props) {
    const form = useForm({
        type: filters.type,
        date_from: filters.date_from,
        date_to: filters.date_to,
        product_id: filters.product_id ?? '',
    });

    const applyFilters = () => {
        router.get('/reports', form.data, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const isProductsReport = form.data.type === 'products';
    const showProductDetail = isProductsReport && form.data.product_id;

    const generate = (event: FormEvent) => {
        event.preventDefault();
        form.post('/reports', { preserveScroll: true });
    };

    const columns: DataTableColumn<ReportRow>[] = Object.keys(
        report.rows[0] ?? { message: 'No data' },
    ).map((key) => ({
        key,
        header: key
            .replaceAll('_', ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase()),
        render: (row) => formatCell(row[key]),
    }));

    return (
        <>
            <Head title="Reports" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <BarChart3 className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">Reports</h1>
                            <p className="text-sm text-muted-foreground">
                                Generate sales, expense, profit, inventory, and
                                tax summaries.
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => downloadCsv(report.title, report.rows)}
                        disabled={report.rows.length === 0}
                    >
                        <Download className="size-4" />
                        Export CSV
                    </Button>
                </div>

                <form
                    onSubmit={generate}
                    className="grid gap-3 rounded-md border bg-card p-4 shadow-sm md:grid-cols-[12rem_10rem_10rem_12rem_auto_auto]"
                >
                    <select
                        value={form.data.type}
                        onChange={(event) =>
                            form.setData('type', event.target.value)
                        }
                        onBlur={applyFilters}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        {types.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={form.data.date_from}
                        onChange={(event) =>
                            form.setData('date_from', event.target.value)
                        }
                        onBlur={applyFilters}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    />
                    <input
                        type="date"
                        value={form.data.date_to}
                        onChange={(event) =>
                            form.setData('date_to', event.target.value)
                        }
                        onBlur={applyFilters}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    />
                    {isProductsReport && (
                        <select
                            value={form.data.product_id}
                            onChange={(event) =>
                                form.setData('product_id', event.target.value)
                            }
                            onBlur={applyFilters}
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="">All products</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={applyFilters}
                    >
                        Preview
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        <Save className="size-4" />
                        Generate
                    </Button>
                </form>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {report.summary.map((item) => (
                        <section
                            key={item.label}
                            className="rounded-md border bg-card p-4 shadow-sm"
                        >
                            <p className="text-sm text-muted-foreground">
                                {item.label}
                            </p>
                            <p className="mt-2 text-2xl font-semibold">
                                {item.value}
                            </p>
                        </section>
                    ))}
                </div>

                {showProductDetail && report.product && (
                    <section className="rounded-md border bg-card p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Product performance
                                </p>
                                <h2 className="text-lg font-semibold">
                                    {report.product.name}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {report.product.category} • Current stock{' '}
                                    {report.product.current_stock}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => form.setData('product_id', '')}
                            >
                                Back to all products
                            </Button>
                        </div>
                    </section>
                )}

                <RevenueOverview
                    title={report.title}
                    description={`${report.date_from} to ${report.date_to}`}
                    data={report.chart}
                />

                {report.topProducts && report.topProducts.length > 0 && (
                    <section className="rounded-md border bg-card p-5 shadow-sm">
                        <h2 className="font-semibold">Top Products</h2>
                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                            {report.topProducts.map((product) => (
                                <div
                                    key={product.name}
                                    className="rounded-md border p-3"
                                >
                                    <p className="font-medium">
                                        {product.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Qty {product.quantity}
                                    </p>
                                    <p className="mt-2 font-semibold">
                                        {product.total.toFixed(2)} ETB
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="rounded-md border bg-card p-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <FileText className="size-5 text-primary" />
                            <h2 className="font-semibold">Report Rows</h2>
                        </div>
                        <DataTable
                            columns={columns}
                            data={withKeys(
                                report.rows.length
                                    ? report.rows
                                    : [
                                          {
                                              message:
                                                  'No data for this report range.',
                                          },
                                      ],
                            )}
                            rowKey={(row) => row.__key as string}
                            emptyMessage="No report rows."
                        />
                    </div>

                    <aside className="rounded-md border bg-card p-4 shadow-sm">
                        <h2 className="font-semibold">Generated Reports</h2>
                        <div className="mt-4 grid gap-3">
                            {recentReports.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Generated report metadata will appear here.
                                </p>
                            ) : (
                                recentReports.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-md border p-3"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-medium">
                                                {item.title}
                                            </p>
                                            <Badge variant="secondary">
                                                {item.type}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {item.date_from} to {item.date_to}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </aside>
                </section>
            </div>
        </>
    );
}

function formatCell(value: string | number | null) {
    if (typeof value === 'number') return value.toFixed(2);
    return value ?? '-';
}

function withKeys(rows: ReportRow[]) {
    return rows.map((row, index) => ({
        ...row,
        __key: `${index}-${Object.values(row).join('-')}`,
    }));
}

function downloadCsv(title: string, rows: ReportRow[]) {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [
        headers.join(','),
        ...rows.map((row) =>
            headers
                .map((header) => JSON.stringify(row[header] ?? ''))
                .join(','),
        ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replaceAll(' ', '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

ReportsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reports', href: '/reports' },
    ],
};
