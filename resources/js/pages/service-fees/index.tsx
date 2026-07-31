import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { ServiceFeeSummary } from '@/components/service-fees/service-fee-summary';
import { ServiceFeeTable, type ServiceFeeRow } from '@/components/service-fees/service-fee-table';
import { Badge } from '@/components/ui/badge';
import { Head, router } from '@inertiajs/react';
import { BadgeDollarSign } from 'lucide-react';

type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Props = {
    serviceFees: Paginated<ServiceFeeRow>;
    summary: { total_owed: number; total_paid: number; total_generated: number; unpaid_count: number };
    setting: { fee_rate: string; is_active: boolean; terms: string | null; effective_from: string | null };
    statuses: Array<{ value: string; label: string }>;
    filters: { search: string | null; status: string | null; from: string | null; to: string | null };
};

export default function ServiceFeesIndex({ serviceFees, summary, setting, statuses, filters }: Props) {
    const applyFilters = (next: Record<string, string | null>) => router.get('/service-fees', {
        search: filters.search ?? '',
        status: filters.status ?? '',
        from: filters.from ?? '',
        to: filters.to ?? '',
        ...next,
    }, { preserveState: true, preserveScroll: true, replace: true });

    return (
        <>
            <Head title="Service Fees" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <BadgeDollarSign className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">Service fees</h1>
                            <p className="text-sm text-muted-foreground">Track BizTrack platform fees generated from completed customer payments.</p>
                        </div>
                    </div>
                    <Badge variant={setting.is_active ? 'default' : 'secondary'}>{setting.fee_rate}% active rate</Badge>
                </div>

                <ServiceFeeSummary summary={summary} />

                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem_10rem_10rem]">
                        <SearchBox defaultValue={filters.search ?? ''} placeholder="Search payment, invoice, amount..." onSearch={(search) => applyFilters({ search })} className="relative w-full" />
                        <select value={filters.status ?? ''} onChange={(event) => applyFilters({ status: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                            <option value="">All statuses</option>
                            {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                        </select>
                        <input type="date" value={filters.from ?? ''} onChange={(event) => applyFilters({ from: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm" />
                        <input type="date" value={filters.to ?? ''} onChange={(event) => applyFilters({ to: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm" />
                    </div>
                    <ServiceFeeTable serviceFees={serviceFees.data} canPay />
                    <div className="mt-4"><Pagination links={serviceFees.links} from={serviceFees.from} to={serviceFees.to} total={serviceFees.total} /></div>
                </section>

                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <h2 className="text-base font-semibold">Current service fee agreement</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{setting.terms ?? 'No custom terms have been recorded yet.'}</p>
                    <p className="mt-3 text-xs text-muted-foreground">Effective from {setting.effective_from ?? 'today'}.</p>
                </section>
            </div>
        </>
    );
}

ServiceFeesIndex.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Service Fees', href: '/service-fees' }] };
