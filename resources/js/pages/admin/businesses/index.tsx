import { Head, router } from '@inertiajs/react';
import { Building2, CalendarDays, Eye, Globe2, Phone, ShieldCheck, Store, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Business = {
    id: number;
    business_name: string;
    business_type: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    status: string;
    status_label: string;
    access_mode: string;
    access_mode_label: string;
    users_count: number;
    products_count: number;
    sales_count: number;
    created_at: string;
    onboarding_completed_at: string;
    trial_started_at: string;
    trial_ends_at: string;
    owner: { name: string; email: string } | null;
    subscription: { name: string; price: number; duration_months: number; max_cashiers: number; status: string } | null;
};

type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Props = {
    businesses: Paginated<Business>;
    statuses: Array<{ value: string; label: string }>;
    filters: { search: string | null; status: string | null };
};

export default function AdminBusinessesIndex({ businesses, statuses, filters }: Props) {
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

    const applyFilters = (next: Record<string, string | null>) => router.get(
        '/admin/businesses',
        {
            search: filters.search ?? '',
            status: filters.status ?? '',
            ...next,
        },
        { preserveState: true, preserveScroll: true, replace: true },
    );

    const columns: DataTableColumn<Business>[] = [
        {
            key: 'business_name',
            header: 'Business',
            render: (business) => (
                <div>
                    <p className="font-medium">{business.business_name}</p>
                    <p className="text-xs text-muted-foreground">{business.email ?? business.phone ?? 'No contact'}</p>
                </div>
            ),
        },
        { key: 'owner', header: 'Owner', render: (business) => business.owner?.name ?? 'No owner' },
        { key: 'business_type', header: 'Type', render: (business) => business.business_type ?? 'Not set' },
        {
            key: 'subscription',
            header: 'Subscription',
            render: (business) => business.subscription ? (
                <div>
                    <p className="font-medium">{business.subscription.name}</p>
                    <p className="text-xs text-muted-foreground">{business.subscription.price.toFixed(2)} ETB</p>
                </div>
            ) : 'No plan',
        },
        {
            key: 'status',
            header: 'Status',
            render: (business) => (
                <Badge variant={business.status === 'active' ? 'default' : 'secondary'}>
                    {business.status_label}
                </Badge>
            ),
        },
        {
            key: 'created_at',
            header: 'Registration',
            render: (business) => (
                <div>
                    <p className="font-medium">{business.created_at}</p>
                    <p className="text-xs text-muted-foreground">{business.access_mode_label}</p>
                </div>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (business) => (
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedBusiness(business)}>
                    <Eye className="size-4" />
                    View details
                </Button>
            ),
        },
    ];

    return (
        <>
            <Head title="Businesses" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                        <Building2 className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Businesses</h1>
                        <p className="text-sm text-muted-foreground">View and search businesses with owner, plan, status, and registration details.</p>
                    </div>
                </div>

                <div className="grid gap-3 rounded-md border bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_12rem]">
                    <SearchBox
                        defaultValue={filters.search ?? ''}
                        placeholder="Search businesses..."
                        onSearch={(search) => applyFilters({ search })}
                        className="relative w-full"
                    />
                    <select
                        value={filters.status ?? ''}
                        onChange={(event) => applyFilters({ status: event.target.value })}
                        className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                    >
                        <option value="">All statuses</option>
                        {statuses.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>

                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <DataTable columns={columns} data={businesses.data} rowKey={(business) => business.id} emptyMessage="No businesses match the current filters." />
                    <div className="mt-4">
                        <Pagination links={businesses.links} from={businesses.from} to={businesses.to} total={businesses.total} />
                    </div>
                </section>
            </div>

            <Dialog open={Boolean(selectedBusiness)} onOpenChange={(open) => !open && setSelectedBusiness(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{selectedBusiness?.business_name ?? 'Business details'}</DialogTitle>
                        <DialogDescription>Existing business data from the current tenant database.</DialogDescription>
                    </DialogHeader>

                    {selectedBusiness && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <DetailCard
                                icon={Store}
                                title="Business"
                                items={[
                                    ['Name', selectedBusiness.business_name],
                                    ['Type', selectedBusiness.business_type ?? 'Not set'],
                                    ['Contact email', selectedBusiness.email ?? 'Not set'],
                                    ['Phone', selectedBusiness.phone ?? 'Not set'],
                                ]}
                            />
                            <DetailCard
                                icon={ShieldCheck}
                                title="Status"
                                items={[
                                    ['Status', selectedBusiness.status_label],
                                    ['Registration state', selectedBusiness.access_mode_label],
                                    ['Created at', selectedBusiness.created_at],
                                    ['Onboarding completed', selectedBusiness.onboarding_completed_at],
                                ]}
                            />
                            <DetailCard
                                icon={Users}
                                title="Ownership"
                                items={[
                                    ['Owner', selectedBusiness.owner?.name ?? 'Unassigned'],
                                    ['Owner email', selectedBusiness.owner?.email ?? 'Not set'],
                                    ['Users', String(selectedBusiness.users_count)],
                                    ['Sales', String(selectedBusiness.sales_count)],
                                ]}
                            />
                            <DetailCard
                                icon={CalendarDays}
                                title="Registration"
                                items={[
                                    ['Trial started', selectedBusiness.trial_started_at],
                                    ['Trial ends', selectedBusiness.trial_ends_at],
                                    ['Address', selectedBusiness.address ?? 'Not set'],
                                    ['Products', String(selectedBusiness.products_count)],
                                ]}
                            />
                            <DetailCard
                                icon={Globe2}
                                title="Subscription"
                                items={selectedBusiness.subscription ? [
                                    ['Plan', selectedBusiness.subscription.name],
                                    ['Price', `${selectedBusiness.subscription.price.toFixed(2)} ETB`],
                                    ['Duration', `${selectedBusiness.subscription.duration_months} months`],
                                    ['Max cashiers', String(selectedBusiness.subscription.max_cashiers)],
                                ] : [['Plan', 'No subscription assigned']]}
                            />
                            <DetailCard
                                icon={Phone}
                                title="Quick summary"
                                items={[
                                    ['Business status', selectedBusiness.status_label],
                                    ['Registration state', selectedBusiness.access_mode_label],
                                    ['Owner contact', selectedBusiness.owner?.email ?? selectedBusiness.email ?? 'Not set'],
                                    ['Record id', String(selectedBusiness.id)],
                                ]}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminBusinessesIndex.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Businesses', href: '/admin/businesses' }] };

function DetailCard({ icon: Icon, title, items }: { icon: LucideIcon; title: string; items: Array<[string, string]> }) {
    return (
        <section className="rounded-md border bg-background p-4">
            <div className="flex items-center gap-2">
                <Icon className="size-4 text-primary" />
                <h3 className="font-semibold">{title}</h3>
            </div>
            <dl className="mt-3 grid gap-2 text-sm">
                {items.map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-3 rounded-md bg-muted/30 px-3 py-2">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="text-right font-medium">{value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
