import { Head } from '@inertiajs/react';
import { Building2, Clock3, CreditCard, Users } from 'lucide-react';
import { AdminAreaPanel, AdminDonutPanel, AdminRankedBars } from '@/components/admin/admin-analytics';
import type { AdminPoint } from '@/components/admin/admin-analytics';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { StatCard } from '@/components/stat-card/stat-card';
import { Badge } from '@/components/ui/badge';

type SummaryPoint = { label: string; value: string };
type ChartPoint = { label: string; value: number };
type GrowthRow = { business_name: string; owner: string; plan: string; access_mode: string; status: string; created_at: string };
type Props = { report: { title: string; date_from: string; date_to: string; summary: SummaryPoint[]; chart: ChartPoint[]; accessMix: AdminPoint[]; categoryMix: AdminPoint[]; rows: GrowthRow[] } };

export default function AdminBusinessGrowth({ report }: Props) {
    const columns: DataTableColumn<GrowthRow>[] = [
        { key: 'business_name', header: 'Business' },
        { key: 'owner', header: 'Owner' },
        { key: 'plan', header: 'Plan' },
        { key: 'access_mode', header: 'State', render: (row) => <Badge variant={row.access_mode === 'Active' ? 'default' : row.access_mode === 'Suspended' ? 'destructive' : 'secondary'}>{row.access_mode}</Badge> },
        { key: 'status', header: 'Record Status' },
        { key: 'created_at', header: 'Created At' },
    ];

    const summaryIcons = [Building2, Users, Clock3, CreditCard];

    return (
        <>
            <Head title="Business Growth" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div>
                    <h1 className="text-xl font-semibold">Business Growth</h1>
                    <p className="text-sm text-muted-foreground">Platform-wide growth snapshot for {report.date_from} to {report.date_to}.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    {report.summary.map((point, index) => (
                        <StatCard key={point.label} label={point.label} value={point.value} icon={summaryIcons[index] ?? Building2} tone={(['emerald', 'blue', 'amber', 'rose'] as const)[index] ?? 'emerald'} />
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.85fr)]">
                    <AdminAreaPanel
                        title={report.title}
                        description={`${report.date_from} to ${report.date_to}`}
                        data={report.chart}
                    />
                    <AdminDonutPanel
                        title="Access state mix"
                        description="How businesses are distributed across trial, active, onboarding, and suspended states."
                        data={report.accessMix}
                    />
                </div>

                <AdminRankedBars
                    title="Category growth"
                    description="Most common business categories currently represented on BizTrack."
                    data={report.categoryMix}
                />

                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <h2 className="mb-4 font-semibold">New businesses</h2>
                    <DataTable columns={columns} data={report.rows} rowKey={(row) => `${row.business_name}-${row.created_at}`} emptyMessage="No businesses were created in this range." />
                </section>
            </div>
        </>
    );
}

AdminBusinessGrowth.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Reports', href: '/admin/reports/business-growth' }, { title: 'Business Growth', href: '/admin/reports/business-growth' }] };
