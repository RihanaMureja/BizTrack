import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { ServiceFeeSummary } from '@/components/service-fees/service-fee-summary';
import { ServiceFeeTable, type ServiceFeeRow } from '@/components/service-fees/service-fee-table';
import { Button } from '@/components/ui/button';
import { Head, router, useForm } from '@inertiajs/react';
import { BadgeDollarSign, Save } from 'lucide-react';
import { FormEvent } from 'react';

type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Business = {
    id: number;
    business_name: string;
    email: string | null;
    service_fee_setting: { fee_rate: string; is_active: boolean; terms: string | null; effective_from: string | null } | null;
};
type Props = {
    serviceFees: Paginated<ServiceFeeRow>;
    summary: { total_owed: number; total_paid: number; total_generated: number; unpaid_count: number };
    businesses: Business[];
    statuses: Array<{ value: string; label: string }>;
    filters: { search: string | null; status: string | null; from: string | null; to: string | null };
};

function SettingRow({ business }: { business: Business }) {
    const form = useForm({
        fee_rate: business.service_fee_setting?.fee_rate ?? '1.00',
        is_active: business.service_fee_setting?.is_active ?? true,
        terms: business.service_fee_setting?.terms ?? '',
        effective_from: business.service_fee_setting?.effective_from ?? '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put(`/admin/businesses/${business.id}/service-fee-setting`, { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="grid gap-3 border-t py-4 first:border-t-0 md:grid-cols-[minmax(0,1fr)_8rem_8rem_minmax(0,1fr)_auto] md:items-end">
            <div>
                <p className="font-medium">{business.business_name}</p>
                <p className="text-xs text-muted-foreground">{business.email ?? 'No email'}</p>
            </div>
            <label className="grid gap-1 text-xs font-medium">
                Rate %
                <input value={form.data.fee_rate} onChange={(event) => form.setData('fee_rate', event.target.value)} type="number" min="0" max="100" step="0.01" className="border-input bg-background h-9 rounded-md border px-3 text-sm" />
            </label>
            <label className="grid gap-1 text-xs font-medium">
                Active
                <select value={form.data.is_active ? '1' : '0'} onChange={(event) => form.setData('is_active', event.target.value === '1')} className="border-input bg-background h-9 rounded-md border px-3 text-sm">
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                </select>
            </label>
            <label className="grid gap-1 text-xs font-medium">
                Terms
                <input value={form.data.terms} onChange={(event) => form.setData('terms', event.target.value)} className="border-input bg-background h-9 rounded-md border px-3 text-sm" />
            </label>
            <Button type="submit" size="sm" disabled={form.processing}>
                <Save className="size-4" /> Save
            </Button>
        </form>
    );
}

export default function AdminServiceFeesIndex({ serviceFees, summary, businesses, statuses, filters }: Props) {
    const applyFilters = (next: Record<string, string | null>) => router.get('/admin/service-fees', {
        search: filters.search ?? '',
        status: filters.status ?? '',
        from: filters.from ?? '',
        to: filters.to ?? '',
        ...next,
    }, { preserveState: true, preserveScroll: true, replace: true });

    return (
        <>
            <Head title="Platform Service Fees" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm"><BadgeDollarSign className="size-5" /></div>
                    <div><h1 className="text-xl font-semibold">Platform service fees</h1><p className="text-sm text-muted-foreground">Monitor BizTrack revenue from business payment activity and manage agreed fee rates.</p></div>
                </div>

                <ServiceFeeSummary summary={summary} />

                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem_10rem_10rem]">
                        <SearchBox defaultValue={filters.search ?? ''} placeholder="Search business, payment, invoice..." onSearch={(search) => applyFilters({ search })} className="relative w-full" />
                        <select value={filters.status ?? ''} onChange={(event) => applyFilters({ status: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                            <option value="">All statuses</option>
                            {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                        </select>
                        <input type="date" value={filters.from ?? ''} onChange={(event) => applyFilters({ from: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm" />
                        <input type="date" value={filters.to ?? ''} onChange={(event) => applyFilters({ to: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm" />
                    </div>
                    <ServiceFeeTable serviceFees={serviceFees.data} admin />
                    <div className="mt-4"><Pagination links={serviceFees.links} from={serviceFees.from} to={serviceFees.to} total={serviceFees.total} /></div>
                </section>

                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <h2 className="text-base font-semibold">Business fee settings</h2>
                    <div className="mt-2">
                        {businesses.map((business) => <SettingRow key={business.id} business={business} />)}
                    </div>
                </section>
            </div>
        </>
    );
}

AdminServiceFeesIndex.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Service Fees', href: '/admin/service-fees' }] };
