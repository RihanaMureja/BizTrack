import { Head } from '@inertiajs/react';
import { BadgeDollarSign, Building2, CreditCard, TrendingUp } from 'lucide-react';
import { RevenueOverview } from '@/components/charts/revenue-overview';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { StatCard } from '@/components/stat-card/stat-card';
import { Badge } from '@/components/ui/badge';

type SummaryPoint = { label: string; value: string };
type ChartPoint = { label: string; value: number };
type RevenueRow = { name: string; price: number; duration_months: number; max_cashiers: number; businesses_count: number; estimated_mrr: number; status: string };
type TopPlan = RevenueRow;
type Props = { report: { title: string; summary: SummaryPoint[]; chart: ChartPoint[]; rows: RevenueRow[]; topPlans: TopPlan[] } };

export default function AdminRevenue({ report }: Props) {
    const columns: DataTableColumn<RevenueRow>[] = [
        { key: 'name', header: 'Plan' },
        { key: 'price', header: 'Price', render: (row) => `${row.price.toFixed(2)} ETB` },
        { key: 'duration_months', header: 'Duration' },
        { key: 'max_cashiers', header: 'Cashiers' },
        { key: 'businesses_count', header: 'Businesses' },
        { key: 'estimated_mrr', header: 'Estimated MRR', render: (row) => `${row.estimated_mrr.toFixed(2)} ETB` },
        { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>{row.status}</Badge> },
    ];

    const summaryIcons = [CreditCard, Building2, BadgeDollarSign, TrendingUp];

    return (
        <>
            <Head title="Revenue" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div>
                    <h1 className="text-xl font-semibold">Revenue</h1>
                    <p className="text-sm text-muted-foreground">Platform-wide revenue derived from active plan assignments and estimated monthly recurring revenue.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    {report.summary.map((point, index) => (
                        <StatCard key={point.label} label={point.label} value={point.value} icon={summaryIcons[index] ?? CreditCard} tone={(['emerald', 'blue', 'amber', 'rose'] as const)[index] ?? 'emerald'} />
                    ))}
                </div>

                <RevenueOverview title={report.title} description="Estimated monthly revenue contribution by active subscription plan" data={report.chart} />

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
                    <div className="rounded-md border bg-card p-4 shadow-sm">
                        <h2 className="mb-4 font-semibold">Plan Revenue</h2>
                        <DataTable columns={columns} data={report.rows} rowKey={(row) => row.name} emptyMessage="No active plans found yet." />
                    </div>

                    <aside className="rounded-md border bg-card p-4 shadow-sm">
                        <h2 className="font-semibold">Top plans</h2>
                        <div className="mt-4 grid gap-3">
                            {report.topPlans.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Top-plan ranking will appear once businesses are assigned to active plans.</p>
                            ) : report.topPlans.map((plan) => (
                                <div key={plan.name} className="rounded-md border p-3">
                                    <p className="font-medium">{plan.name}</p>
                                    <p className="text-xs text-muted-foreground">{plan.businesses_count} businesses</p>
                                    <p className="mt-2 text-sm font-semibold">{plan.estimated_mrr.toFixed(2)} ETB</p>
                                </div>
                            ))}
                        </div>
                    </aside>
                </section>
            </div>
        </>
    );
}

AdminRevenue.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Reports', href: '/admin/reports/revenue' }, { title: 'Revenue', href: '/admin/reports/revenue' }] };
