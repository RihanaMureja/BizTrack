import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import { Save, Users } from 'lucide-react';
import { useState } from 'react';

type User = { id: number; first_name: string | null; last_name: string | null; email: string; role: string; role_label: string; status: string; business: { business_name: string } | null };
type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Option = { value: string; label: string };
type Props = { users: Paginated<User>; roles: Option[]; statuses: Option[]; filters: { search: string | null; role: string | null; status: string | null } };

export default function AdminUsersIndex({ users, roles, statuses, filters }: Props) {
    const [drafts, setDrafts] = useState<Record<number, { role: string; status: string }>>({});
    const draftFor = (user: User) => drafts[user.id] ?? { role: user.role, status: user.status };
    const applyFilters = (next: Record<string, string | null>) => router.get('/admin/users', { search: filters.search ?? '', role: filters.role ?? '', status: filters.status ?? '', ...next }, { preserveState: true, preserveScroll: true, replace: true });
    const columns: DataTableColumn<User>[] = [
        { key: 'email', header: 'User', render: (user) => <div><p className="font-medium">{[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email}</p><p className="text-xs text-muted-foreground">{user.email}</p></div> },
        { key: 'business', header: 'Business', render: (user) => user.business?.business_name ?? 'Platform' },
        { key: 'role', header: 'Role', render: (user) => <select value={draftFor(user).role} onChange={(event) => setDrafts({ ...drafts, [user.id]: { ...draftFor(user), role: event.target.value } })} className="border-input bg-background h-9 rounded-md border px-2 text-xs">{roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select> },
        { key: 'status', header: 'Status', render: (user) => <select value={draftFor(user).status} onChange={(event) => setDrafts({ ...drafts, [user.id]: { ...draftFor(user), status: event.target.value } })} className="border-input bg-background h-9 rounded-md border px-2 text-xs">{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select> },
        { key: 'actions', header: '', className: 'text-right', render: (user) => <Button type="button" variant="outline" size="sm" onClick={() => router.put(`/admin/users/${user.id}`, draftFor(user), { preserveScroll: true })}><Save className="size-4" /> Save</Button> },
    ];

    return (
        <>
            <Head title="Manage Users" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm"><Users className="size-5" /></div><div><h1 className="text-xl font-semibold">Users</h1><p className="text-sm text-muted-foreground">Manage business owners, cashiers, super admins, role assignment, and account status.</p></div></div>
                <div className="grid gap-3 rounded-md border bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
                    <SearchBox defaultValue={filters.search ?? ''} placeholder="Search users..." onSearch={(search) => applyFilters({ search })} className="relative w-full" />
                    <select value={filters.role ?? ''} onChange={(event) => applyFilters({ role: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm"><option value="">All roles</option>{roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select>
                    <select value={filters.status ?? ''} onChange={(event) => applyFilters({ status: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm"><option value="">All statuses</option>{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select>
                </div>
                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between"><p className="text-sm text-muted-foreground">Platform accounts</p><Badge variant="secondary">{users.total} users</Badge></div>
                    <DataTable columns={columns} data={users.data} rowKey={(user) => user.id} emptyMessage="No users match the current filters." />
                    <div className="mt-4"><Pagination links={users.links} from={users.from} to={users.to} total={users.total} /></div>
                </section>
            </div>
        </>
    );
}

AdminUsersIndex.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Users', href: '/admin/users' }] };
