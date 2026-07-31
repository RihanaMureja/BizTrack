import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, Check, Eye, Power } from 'lucide-react';

type Business = {
    id: number;
    business_name: string;
    business_type: string | null;
    email: string | null;
    status: string;
    users_count: number;
    products_count: number;
    sales_count: number;
    owner: { email: string; first_name: string | null; last_name: string | null } | null;
    subscription: { name: string } | null;
};
type Subscription = { id: number; name: string; price: string; status: string };
type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Props = {
    businesses: Paginated<Business>;
    subscriptions: Subscription[];
    statuses: Array<{ value: string; label: string }>;
    filters: { search: string | null; status: string | null };
};

export default function AdminBusinessesIndex({ businesses, subscriptions, statuses, filters }: Props) {
    const applyFilters = (next: Record<string, string | null>) => router.get('/admin/businesses', {
        search: filters.search ?? '',
        status: filters.status ?? '',
        ...next,
    }, { preserveState: true, preserveScroll: true, replace: true });

    const columns: DataTableColumn<Business>[] = [
        { key: 'business_name', header: 'Business', render: (business) => <div><p className="font-medium">{business.business_name}</p><p className="text-xs text-muted-foreground">{business.email ?? business.business_type ?? 'No contact'}</p></div> },
        { key: 'owner', header: 'Owner', render: (business) => business.owner?.email ?? 'No owner' },
        { key: 'subscription', header: 'Plan', render: (business) => business.subscription?.name ?? 'No plan' },
        { key: 'users_count', header: 'Users' },
        { key: 'status', header: 'Status', render: (business) => <Badge variant={business.status === 'active' ? 'default' : 'secondary'}>{business.status}</Badge> },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (business) => (
                <div className="flex flex-wrap justify-end gap-2">
                    <select
                        defaultValue=""
                        onChange={(event) => event.target.value && router.put(`/admin/businesses/${business.id}/subscription`, { subscription_id: event.target.value }, { preserveScroll: true })}
                        className="border-input bg-background h-9 rounded-md border px-2 text-xs"
                    >
                        <option value="">Change plan</option>
                        {subscriptions.map((subscription) => <option key={subscription.id} value={subscription.id}>{subscription.name}</option>)}
                    </select>
                    <Button asChild type="button" variant="outline" size="sm">
                        <Link href={`/admin/business-verifications/${business.id}`}>
                            <Eye className="size-4" /> Review
                        </Link>
                    </Button>
                    {business.status === 'active' ? (
                        <Button type="button" variant="outline" size="sm" onClick={() => router.post(`/admin/businesses/${business.id}/deactivate`, {}, { preserveScroll: true })}>
                            <Power className="size-4" /> Deactivate
                        </Button>
                    ) : (
                        <Button type="button" size="sm" onClick={() => router.post(`/admin/businesses/${business.id}/approve`, {}, { preserveScroll: true })}>
                            <Check className="size-4" /> Approve
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Manage Businesses" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm"><Building2 className="size-5" /></div>
                    <div><h1 className="text-xl font-semibold">Businesses</h1><p className="text-sm text-muted-foreground">Approve, deactivate, and assign subscription plans across the platform.</p></div>
                </div>
                <div className="grid gap-3 rounded-md border bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_12rem]">
                    <SearchBox defaultValue={filters.search ?? ''} placeholder="Search businesses..." onSearch={(search) => applyFilters({ search })} className="relative w-full" />
                    <select value={filters.status ?? ''} onChange={(event) => applyFilters({ status: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                        <option value="">All statuses</option>
                        {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                    </select>
                </div>
                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <DataTable columns={columns} data={businesses.data} rowKey={(business) => business.id} emptyMessage="No businesses match the current filters." />
                    <div className="mt-4"><Pagination links={businesses.links} from={businesses.from} to={businesses.to} total={businesses.total} /></div>
                </section>
            </div>
        </>
    );
}

AdminBusinessesIndex.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Businesses', href: '/admin/businesses' }] };
