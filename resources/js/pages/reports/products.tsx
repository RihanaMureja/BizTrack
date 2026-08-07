import { SalesTrendChart, type SalesTrendPoint } from '@/components/reports/sales-trend-chart';
import { ReportFilterBar } from '@/components/reports/report-filter-bar';
import { DataTable, type DataTableColumn } from '@/components/data-table/data-table';
import { Head } from '@inertiajs/react';

type Product = { id: number; name: string; category?: { name: string } | null };
type Summary = { quantity_sold: number; revenue: number; batch_cost: number; profit: number; margin: number };
type SaleRow = { invoice: string; date: string; quantity: number; revenue: number; cost: number };
type Props = {
    report: { product: Product; summary: Summary; trend: SalesTrendPoint[]; sales: SaleRow[] };
    filters: { date_from: string; date_to: string };
};

export default function ProductReport({ report, filters }: Props) {
    const columns: DataTableColumn<SaleRow>[] = [
        { key: 'invoice', header: 'Invoice' },
        { key: 'date', header: 'Date' },
        { key: 'quantity', header: 'Qty' },
        { key: 'revenue', header: 'Revenue', render: (row) => `${row.revenue.toFixed(2)} ETB` },
        { key: 'cost', header: 'Batch cost', render: (row) => `${row.cost.toFixed(2)} ETB` },
    ];

    return (
        <>
            <Head title={`${report.product.name} Report`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div>
                    <h1 className="text-xl font-semibold">{report.product.name}</h1>
                    <p className="text-sm text-muted-foreground">{report.product.category?.name ?? 'Uncategorized'} product analytics using real batch cost.</p>
                </div>
                <ReportFilterBar filters={filters} action={`/reports/products/${report.product.id}`} />
                <div className="grid gap-4 md:grid-cols-4">
                    {Object.entries(report.summary).map(([key, value]) => (
                        <section key={key} className="rounded-md border bg-card p-4 shadow-sm">
                            <p className="text-sm text-muted-foreground">{key.replaceAll('_', ' ')}</p>
                            <p className="mt-2 text-2xl font-semibold">{key === 'margin' ? `${value}%` : Number(value).toFixed(2)}</p>
                        </section>
                    ))}
                </div>
                <SalesTrendChart data={report.trend} title="Product sales trend" />
                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <h2 className="mb-4 font-semibold">Sale detail</h2>
                    <DataTable columns={columns} data={report.sales} rowKey={(row) => row.invoice} emptyMessage="No sales for this product in the selected range." />
                </section>
            </div>
        </>
    );
}

ProductReport.layout = { breadcrumbs: [{ title: 'Reports', href: '/reports' }, { title: 'Product detail', href: '#' }] };
