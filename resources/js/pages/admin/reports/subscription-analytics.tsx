import { Head } from '@inertiajs/react';
import { Building2, CreditCard, FileText, WalletCards } from 'lucide-react';
import { RevenueOverview } from '@/components/charts/revenue-overview';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { StatCard } from '@/components/stat-card/stat-card';
import { Badge } from '@/components/ui/badge';

type SummaryPoint = { label: string; value: string };
type ChartPoint = { label: string; value: number };
type AnalyticsRow = { name: string; price: number; duration_months: number; max_cashiers: number; businesses_count: number; estimated_mrr: number; status: string };
type Props = { report: { title: string; summary: SummaryPoint[]; chart: ChartPoint[]; rows: AnalyticsRow[] } };

export default function AdminSubscriptionAnalytics({ report }: Props) {
    const columns: DataTableColumn<AnalyticsRow>[] = [
        { key: 'name', header: 'Plan' },
        { key: 'price', header: 'Price', render: (row) => `${row.price.toFixed(2)} ETB` },
        { key: 'duration_months', header: 'Duration' },
        { key: 'max_cashiers', header: 'Cashiers' },
        { key: 'businesses_count', header: 'Businesses' },
        { key: 'estimated_mrr', header: 'Estimated MRR', render: (row) => `${row.estimated_mrr.toFixed(2)} ETB` },
        { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>{row.status}</Badge> },
    ];

    const summaryIcons = [CreditCard, FileText, Building2, WalletCards];

    return (
        <>
            <Head title="Subscription Analytics" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div>
                    <h1 className="text-xl font-semibold">Subscription Analytics</h1>
                    <p className="text-sm text-muted-foreground">Derived from the existing plans table and the current business-to-plan assignments.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    {report.summary.map((point, index) => (
                        <StatCard key={point.label} label={point.label} value={point.value} icon={summaryIcons[index] ?? CreditCard} tone={(['emerald', 'blue', 'amber', 'rose'] as const)[index] ?? 'emerald'} />
                    ))}
                </div>

                <RevenueOverview title={report.title} description="Businesses per plan" data={report.chart} />

                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <h2 className="mb-4 font-semibold">Plan breakdown</h2>
                    <DataTable columns={columns} data={report.rows} rowKey={(row) => row.name} emptyMessage="No subscription plans exist yet." />
                </section>
            </div>
        </>
    );
}

AdminSubscriptionAnalytics.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Reports', href: '/admin/reports/subscription-analytics' }, { title: 'Subscription Analytics', href: '/admin/reports/subscription-analytics' }] };
