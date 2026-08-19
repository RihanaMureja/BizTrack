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
    business_category: string | null;
    business_category_label: string;
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
    businessCategories: Array<{ value: string; label: string }>;
    filters: { search: string | null; status: string | null; business_category: string | null };
};

export default function AdminBusinessesIndex({ businesses, statuses, businessCategories, filters }: Props) {
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

    const applyFilters = (next: Record<string, string | null>) => router.get(
        '/admin/businesses',
        {
            search: filters.search ?? '',
            status: filters.status ?? '',
            business_category: filters.business_category ?? '',
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
        { key: 'business_type', header: 'Type', render: (business) => business.business_category_label },
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

                <div className="grid gap-3 rounded-md border bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_12rem_13rem]">
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
                    <select
                        value={filters.business_category ?? ''}
                        onChange={(event) => applyFilters({ business_category: event.target.value })}
                        className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                    >
                        <option value="">All business types</option>
                        {businessCategories.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.label}
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
                <DialogContent className="grid max-h-[86vh] max-w-4xl grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0">
                    <DialogHeader className="border-b px-5 py-4 pr-12">
                        <DialogTitle className="text-base leading-6">{selectedBusiness?.business_name ?? 'Business details'}</DialogTitle>
                        <DialogDescription className="text-xs">Existing business data from the current tenant database.</DialogDescription>
                    </DialogHeader>

                    {selectedBusiness && (
                        <div className="min-h-0 overflow-y-auto px-5 py-4">
                            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                                <SummaryTile label="Status" value={selectedBusiness.status_label} />
                                <SummaryTile label="Access" value={selectedBusiness.access_mode_label} />
                                <SummaryTile label="Plan" value={selectedBusiness.subscription?.name ?? 'No plan'} />
                            </div>

                            <div className="grid gap-3 lg:grid-cols-2">
                            <DetailCard
                                icon={Store}
                                title="Business"
                                items={[
                                    ['Name', selectedBusiness.business_name],
                                    ['Type', selectedBusiness.business_category_label],
                                    ['Custom type', selectedBusiness.business_type ?? 'Not set'],
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
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminBusinessesIndex.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Businesses', href: '/admin/businesses' }] };

function SummaryTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border bg-muted/20 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold">{value}</p>
        </div>
    );
}

function DetailCard({ icon: Icon, title, items }: { icon: LucideIcon; title: string; items: Array<[string, string]> }) {
    return (
        <section className="rounded-md border bg-background p-3">
            <div className="flex items-center gap-2">
                <Icon className="size-3.5 text-primary" />
                <h3 className="text-sm font-semibold">{title}</h3>
            </div>
            <dl className="mt-3 grid gap-1.5 text-xs">
                {items.map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 rounded-md bg-muted/25 px-2.5 py-1.5">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="min-w-0 text-right font-medium break-words">{value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
