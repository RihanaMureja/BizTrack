import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, CreditCard, Power, Save } from 'lucide-react';
import type { FormEvent } from 'react';

type Subscription = { id: number; name: string; price: string; duration_months: number; max_cashiers: number; description: string | null; status: string; businesses_count: number };
type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Props = { subscriptions: Paginated<Subscription>; statuses: Array<{ value: string; label: string }>; filters: { search: string | null; status: string | null } };

export default function AdminSubscriptionsIndex({ subscriptions, statuses, filters }: Props) {
    const form = useForm({ id: null as number | null, name: '', price: '0', duration_months: '1', max_cashiers: '1', description: '', status: 'active' });
    const editing = form.data.id !== null;
    const applyFilters = (next: Record<string, string | null>) => router.get('/admin/subscriptions', { search: filters.search ?? '', status: filters.status ?? '', ...next }, { preserveState: true, preserveScroll: true, replace: true });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        const url = editing ? `/admin/subscriptions/${form.data.id}` : '/admin/subscriptions';
        const options = { preserveScroll: true, onSuccess: () => form.reset() };
        editing ? form.put(url, options) : form.post(url, options);
    };
    const edit = (subscription: Subscription) => form.setData({ id: subscription.id, name: subscription.name, price: subscription.price, duration_months: String(subscription.duration_months), max_cashiers: String(subscription.max_cashiers), description: subscription.description ?? '', status: subscription.status });
    const columns: DataTableColumn<Subscription>[] = [
        { key: 'name', header: 'Plan', render: (plan) => <div><p className="font-medium">{plan.name}</p><p className="text-xs text-muted-foreground">{plan.description ?? 'No description'}</p></div> },
        { key: 'price', header: 'Price', render: (plan) => `${Number(plan.price).toFixed(2)} ETB` },
        { key: 'max_cashiers', header: 'Cashiers' },
        { key: 'businesses_count', header: 'Businesses' },
        { key: 'status', header: 'Status', render: (plan) => <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>{plan.status}</Badge> },
        { key: 'actions', header: '', className: 'text-right', render: (plan) => <div className="flex justify-end gap-2"><Button type="button" variant="outline" size="sm" onClick={() => edit(plan)}>Edit</Button>{plan.status === 'active' ? <Button type="button" variant="outline" size="sm" onClick={() => router.post(`/admin/subscriptions/${plan.id}/deactivate`, {}, { preserveScroll: true })}><Power className="size-4" /> Deactivate</Button> : <Button type="button" size="sm" onClick={() => router.post(`/admin/subscriptions/${plan.id}/activate`, {}, { preserveScroll: true })}><Check className="size-4" /> Activate</Button>}</div> },
    ];

    return (
        <>
            <Head title="Subscriptions" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm"><CreditCard className="size-5" /></div><div><h1 className="text-xl font-semibold">Subscriptions</h1><p className="text-sm text-muted-foreground">Create and maintain platform plans and cashier limits.</p></div></div>
                <form onSubmit={submit} className="grid gap-3 rounded-md border bg-card p-4 shadow-sm md:grid-cols-6">
                    <div className="md:col-span-2"><Label>Name</Label><Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} /></div>
                    <div><Label>Price</Label><Input type="number" min="0" value={form.data.price} onChange={(event) => form.setData('price', event.target.value)} /></div>
                    <div><Label>Months</Label><Input type="number" min="1" value={form.data.duration_months} onChange={(event) => form.setData('duration_months', event.target.value)} /></div>
                    <div><Label>Cashiers</Label><Input type="number" min="1" value={form.data.max_cashiers} onChange={(event) => form.setData('max_cashiers', event.target.value)} /></div>
                    <div><Label>Status</Label><select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)} className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm">{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div>
                    <div className="md:col-span-5"><Label>Description</Label><Input value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} /></div>
                    <div className="flex items-end"><Button type="submit" disabled={form.processing} className="w-full"><Save className="size-4" /> {editing ? 'Update' : 'Create'}</Button></div>
                </form>
                <div className="grid gap-3 rounded-md border bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_12rem]">
                    <SearchBox defaultValue={filters.search ?? ''} placeholder="Search plans..." onSearch={(search) => applyFilters({ search })} className="relative w-full" />
                    <select value={filters.status ?? ''} onChange={(event) => applyFilters({ status: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm"><option value="">All statuses</option>{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select>
                </div>
                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <DataTable columns={columns} data={subscriptions.data} rowKey={(plan) => plan.id} emptyMessage="No subscriptions match the current filters." />
                    <div className="mt-4"><Pagination links={subscriptions.links} from={subscriptions.from} to={subscriptions.to} total={subscriptions.total} /></div>
                </section>
            </div>
        </>
    );
}

AdminSubscriptionsIndex.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Subscriptions', href: '/admin/subscriptions' }] };
