import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { StatCard } from '@/components/stat-card/stat-card';
import { Badge } from '@/components/ui/badge';
import { Head } from '@inertiajs/react';
import { Activity, Building2, CreditCard, Users, WalletCards } from 'lucide-react';

type Stat = { label: string; value: string; trend: string };
type Business = { id: number; business_name: string; business_type: string | null; status: string; owner: { email: string } | null; subscription: { name: string } | null };
type ActivityLog = { id: number; action: string; created_at: string; business: { business_name: string } | null; user: { email: string } | null };
type Props = { stats: Stat[]; recentBusinesses: Business[]; recentActivity: ActivityLog[] };

export default function AdminDashboard({ stats, recentBusinesses, recentActivity }: Props) {
    const businessColumns: DataTableColumn<Business>[] = [
        { key: 'business_name', header: 'Business', render: (business) => <div><p className="font-medium">{business.business_name}</p><p className="text-xs text-muted-foreground">{business.owner?.email ?? 'No owner'}</p></div> },
        { key: 'business_type', header: 'Type' },
        { key: 'subscription', header: 'Plan', render: (business) => business.subscription?.name ?? 'No plan' },
        { key: 'status', header: 'Status', render: (business) => <Badge variant={business.status === 'active' ? 'default' : 'secondary'}>{business.status}</Badge> },
    ];
    const activityColumns: DataTableColumn<ActivityLog>[] = [
        { key: 'action', header: 'Action', render: (log) => <div><p className="font-medium">{log.action}</p><p className="text-xs text-muted-foreground">{log.business?.business_name ?? 'Platform'}</p></div> },
        { key: 'user', header: 'User', render: (log) => log.user?.email ?? 'System' },
        { key: 'created_at', header: 'Created' },
    ];

    return (
        <>
            <Head title="Super Admin" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                        <Activity className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Super Admin</h1>
                        <p className="text-sm text-muted-foreground">Monitor platform health, businesses, users, plans, and recent system activity.</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    {stats.map((stat, index) => (
                        <StatCard key={stat.label} {...stat} icon={[Building2, Users, CreditCard, WalletCards][index] ?? Activity} tone={(['emerald', 'blue', 'amber', 'rose'] as const)[index] ?? 'emerald'} />
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <section className="rounded-md border bg-card p-4 shadow-sm">
                        <h2 className="mb-4 font-semibold">Recent Businesses</h2>
                        <DataTable columns={businessColumns} data={recentBusinesses} rowKey={(business) => business.id} emptyMessage="No businesses registered yet." />
                    </section>
                    <section className="rounded-md border bg-card p-4 shadow-sm">
                        <h2 className="mb-4 font-semibold">System Activity</h2>
                        <DataTable columns={activityColumns} data={recentActivity} rowKey={(log) => log.id} emptyMessage="No audit activity yet." />
                    </section>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }] };
