import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { ProfitByProductChart, type ProductProfitPoint } from '@/components/reports/profit-by-product-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { BarChart3, Download, FileText, Save, TrendingUp } from 'lucide-react';
import type { FormEvent } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type SummaryPoint = { label: string; value: string };
type ChartPoint = { label: string; value: number };
type ReportRow = Record<string, string | number | null>;
type ReportType = { value: string; label: string };
type ExpenseSource = { value: string; label: string };
type Category = { id: number; name: string };
type RecentReport = { id: number; type: string; title: string; date_from: string | null; date_to: string | null; generated_at: string };
type Props = {
    report: {
        type: string;
        title: string;
        date_from: string;
        date_to: string;
        summary: SummaryPoint[];
        chart: ChartPoint[];
        rows: ReportRow[];
        topProducts?: Array<{ id: number; name: string; quantity: number; total: number; href: string }>;
        productProfit?: ProductProfitPoint[];
    };
    recentReports: RecentReport[];
    types: ReportType[];
    sources: ExpenseSource[];
    categories: Category[];
    filters: { type: string; date_from: string; date_to: string; source: string; category_id: string | number };
};

export default function ReportsIndex({ report, recentReports, types, sources, categories, filters }: Props) {
    const form = useForm({
        type: filters.type,
        date_from: filters.date_from,
        date_to: filters.date_to,
        source: filters.source,
        category_id: String(filters.category_id ?? ''),
    });

    const applyFilters = () => {
        router.get('/reports', form.data, { preserveState: true, preserveScroll: true, replace: true });
    };

    const generate = (event: FormEvent) => {
        event.preventDefault();
        form.post('/reports', { preserveScroll: true });
    };

    const columns: DataTableColumn<ReportRow>[] = Object.keys(report.rows[0] ?? { message: 'No data' }).map((key) => ({
        key,
        header: key.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
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
                            <p className="text-sm text-muted-foreground">Generate sales, expense, profit, inventory, and tax summaries.</p>
                        </div>
                    </div>
                    <Button type="button" variant="outline" onClick={() => downloadCsv(report.title, report.rows)} disabled={report.rows.length === 0}>
                        <Download className="size-4" />
                        Export CSV
                    </Button>
                </div>

                <form onSubmit={generate} className="grid gap-3 rounded-md border bg-card p-4 shadow-sm md:grid-cols-[12rem_10rem_10rem_11rem_12rem_auto_auto]">
                    <select value={form.data.type} onChange={(event) => form.setData('type', event.target.value)} onBlur={applyFilters} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                        {types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                    <input type="date" value={form.data.date_from} onChange={(event) => form.setData('date_from', event.target.value)} onBlur={applyFilters} className="border-input bg-background h-10 rounded-md border px-3 text-sm" />
                    <input type="date" value={form.data.date_to} onChange={(event) => form.setData('date_to', event.target.value)} onBlur={applyFilters} className="border-input bg-background h-10 rounded-md border px-3 text-sm" />
                    <select value={form.data.source} onChange={(event) => form.setData('source', event.target.value)} onBlur={applyFilters} className="border-input bg-background h-10 rounded-md border px-3 text-sm" disabled={!['expenses', 'profit'].includes(form.data.type)}>
                        <option value="">All sources</option>
                        {sources.map((source) => <option key={source.value} value={source.value}>{source.label}</option>)}
                    </select>
                    <select value={form.data.category_id} onChange={(event) => form.setData('category_id', event.target.value)} onBlur={applyFilters} className="border-input bg-background h-10 rounded-md border px-3 text-sm" disabled={!['sales', 'profit'].includes(form.data.type)}>
                        <option value="">All categories</option>
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                    <Button type="button" variant="outline" onClick={applyFilters}>Preview</Button>
                    <Button type="submit" disabled={form.processing}>
                        <Save className="size-4" />
                        Generate
                    </Button>
                </form>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {report.summary.map((item) => (
                        <section key={item.label} className="overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">{item.label}</p>
                                    <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                                </div>
                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <TrendingUp className="size-5" />
                                </div>
                            </div>
                        </section>
                    ))}
                </div>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <h2 className="font-semibold">{report.title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{report.date_from} to {report.date_to}</p>
                        <div className="mt-5 h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={report.chart}>
                                    <defs>
                                        <linearGradient id="reportArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.34} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.03} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                                    <YAxis tickLine={false} axisLine={false} fontSize={11} width={44} />
                                    <Tooltip contentStyle={{ borderRadius: 10, borderColor: 'var(--border)' }} />
                                    <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fill="url(#reportArea)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <h2 className="font-semibold">Distribution</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Compact comparison of the same report points.</p>
                        <div className="mt-5 h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={report.chart} layout="vertical">
                                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} fontSize={11} width={72} />
                                    <Tooltip contentStyle={{ borderRadius: 10, borderColor: 'var(--border)' }} />
                                    <Bar dataKey="value" fill="var(--primary)" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>

                {report.productProfit && report.productProfit.length > 0 && (
                    <ProfitByProductChart data={report.productProfit} />
                )}

                {report.topProducts && report.topProducts.length > 0 && (
                    <section className="rounded-md border bg-card p-5 shadow-sm">
                        <h2 className="font-semibold">Top Products</h2>
                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                            {report.topProducts.map((product) => (
                                <div key={product.name} className="rounded-md border p-3">
                                    <Link href={product.href} className="font-medium text-primary underline-offset-4 hover:underline">{product.name}</Link>
                                    <p className="text-sm text-muted-foreground">Qty {product.quantity}</p>
                                    <p className="mt-2 font-semibold">{product.total.toFixed(2)} ETB</p>
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
                        <DataTable columns={columns} data={withKeys(report.rows.length ? report.rows : [{ message: 'No data for this report range.' }])} rowKey={(row) => row.__key as string} emptyMessage="No report rows." />
                    </div>

                    <aside className="rounded-md border bg-card p-4 shadow-sm">
                        <h2 className="font-semibold">Generated Reports</h2>
                        <div className="mt-4 grid gap-3">
                            {recentReports.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Generated report metadata will appear here.</p>
                            ) : recentReports.map((item) => (
                                <div key={item.id} className="rounded-md border p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium">{item.title}</p>
                                        <Badge variant="secondary">{item.type}</Badge>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">{item.date_from} to {item.date_to}</p>
                                </div>
                            ))}
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
    return rows.map((row, index) => ({ ...row, __key: `${index}-${Object.values(row).join('-')}` }));
}

function downloadCsv(title: string, rows: ReportRow[]) {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [
        headers.join(','),
        ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? '')).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replaceAll(' ', '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

ReportsIndex.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Reports', href: '/reports' }] };
