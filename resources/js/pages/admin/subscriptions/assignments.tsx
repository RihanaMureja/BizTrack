import { Head, router } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';

type BusinessRow = {
    id: number;
    business_name: string;
    business_type: string | null;
    status: string;
    status_label: string;
    access_mode: string;
    access_mode_label: string;
    trial_started_at: string;
    trial_ends_at: string;
    renewal: string;
    onboarding_completed_at: string;
    users_count: number;
    owner: { name: string; email: string } | null;
    subscription: { name: string; price: number; duration_months: number; max_cashiers: number; status: string } | null;
};
type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Props = {
    businesses: Paginated<BusinessRow>;
    statusOptions: Array<{ value: string; label: string }>;
    filters: { search: string | null; status: string | null };
    note: string;
};

export default function AdminSubscriptionAssignmentsIndex({ businesses, statusOptions, filters, note }: Props) {
    const applyFilters = (next: Record<string, string | null>) => router.get('/admin/subscriptions/assignments', {
        search: filters.search ?? '',
        status: filters.status ?? '',
        ...next,
    }, { preserveState: true, preserveScroll: true, replace: true });

    const columns: DataTableColumn<BusinessRow>[] = [
        { key: 'business_name', header: 'Business', render: (business) => <div><p className="font-medium">{business.business_name}</p><p className="text-xs text-muted-foreground">{business.business_type ?? 'No type'}</p></div> },
        { key: 'owner', header: 'Owner', render: (business) => <div><p className="font-medium">{business.owner?.name ?? 'Unassigned'}</p><p className="text-xs text-muted-foreground">{business.owner?.email ?? 'No email'}</p></div> },
        { key: 'subscription', header: 'Plan', render: (business) => business.subscription ? <div><p className="font-medium">{business.subscription.name}</p><p className="text-xs text-muted-foreground">{business.subscription.price.toFixed(2)} ETB · {business.subscription.duration_months} mo · {business.subscription.max_cashiers} cashiers</p></div> : 'No plan' },
        { key: 'access_mode', header: 'State', render: (business) => <Badge variant={business.access_mode === 'active' ? 'default' : business.access_mode === 'suspended' ? 'destructive' : 'secondary'}>{business.access_mode_label}</Badge> },
        { key: 'trial_ends_at', header: 'Trial Ends', render: (business) => business.trial_ends_at || '-' },
        { key: 'renewal', header: 'Renewal', render: (business) => business.renewal },
        { key: 'users_count', header: 'Users' },
    ];

    return (
        <>
            <Head title="Subscriptions" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                        <FileText className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Subscriptions</h1>
                        <p className="text-sm text-muted-foreground">Current business-to-plan assignments. This is a snapshot, not a billing ledger.</p>
                    </div>
                </div>

                <p className="rounded-md border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">{note}</p>

                <div className="grid gap-3 rounded-md border bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_14rem]">
                    <SearchBox defaultValue={filters.search ?? ''} placeholder="Search businesses or plans..." onSearch={(search) => applyFilters({ search })} className="relative w-full" />
                    <select value={filters.status ?? ''} onChange={(event) => applyFilters({ status: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                        <option value="">All states</option>
                        {statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                    </select>
                </div>

                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <DataTable columns={columns} data={businesses.data} rowKey={(business) => business.id} emptyMessage="No businesses currently have an assigned plan." />
                    <div className="mt-4">
                        <Pagination links={businesses.links} from={businesses.from} to={businesses.to} total={businesses.total} />
                    </div>
                </section>
            </div>
        </>
    );
}

AdminSubscriptionAssignmentsIndex.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Subscriptions', href: '/admin/subscriptions/assignments' }] };
