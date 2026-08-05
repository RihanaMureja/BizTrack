import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, router } from '@inertiajs/react';
import { Ban, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';

type User = { id: number; first_name: string | null; last_name: string | null; email: string; role: string; role_label: string; status: string; business: { business_name: string } | null };
type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Option = { value: string; label: string };
type Props = { users: Paginated<User>; roles: Option[]; statuses: Option[]; filters: { search: string | null; role: string | null; status: string | null }; currentUserId: number };

const prettyStatus = (status: string) => status.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
const statusVariant = (status: string) => status === 'active' ? 'default' : status === 'suspended' || status === 'rejected' ? 'destructive' : 'secondary';
const roleVariant = (role: string) => role === 'super_admin' ? 'default' : role === 'owner' ? 'secondary' : 'outline';

export default function AdminUsersIndex({ users, roles, statuses, filters, currentUserId }: Props) {
    const [statusTarget, setStatusTarget] = useState<User | null>(null);
    const applyFilters = (next: Record<string, string | null>) => router.get('/admin/users', { search: filters.search ?? '', role: filters.role ?? '', status: filters.status ?? '', ...next }, { preserveState: true, preserveScroll: true, replace: true });
    const statusOptions = statuses.filter((status) => status.value !== statusTarget?.status);
    const updateStatus = (status: string) => {
        if (!statusTarget) return;

        router.put(`/admin/users/${statusTarget.id}`, { status }, {
            preserveScroll: true,
            onSuccess: () => setStatusTarget(null),
        });
    };
    const columns: DataTableColumn<User>[] = [
        { key: 'email', header: 'User', render: (user) => <div><p className="font-medium">{[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email}</p><p className="text-xs text-muted-foreground">{user.email}</p></div> },
        { key: 'business', header: 'Business', render: (user) => user.business?.business_name ?? 'Platform' },
        { key: 'role', header: 'Role', render: (user) => <Badge variant={roleVariant(user.role)}>{user.role_label}</Badge> },
        { key: 'status', header: 'Status', render: (user) => <Badge variant={statusVariant(user.status)}>{prettyStatus(user.status)}</Badge> },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (user) => {
                const locked = user.role === 'super_admin' || user.id === currentUserId;

                return locked ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <ShieldCheck className="size-3.5" /> Protected
                    </span>
                ) : (
                    <Button type="button" variant="outline" size="sm" onClick={() => setStatusTarget(user)}>
                        Manage status
                    </Button>
                );
            },
        },
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

            <Dialog open={Boolean(statusTarget)} onOpenChange={(open) => !open && setStatusTarget(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Update account status</DialogTitle>
                        <DialogDescription>
                            Choose the next status for {statusTarget?.email}. Role changes are intentionally unavailable from this screen.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {statusOptions.map((status) => {
                            const isActive = status.value === 'active';
                            const isRisky = ['inactive', 'suspended', 'rejected'].includes(status.value);

                            return (
                                <button
                                    key={status.value}
                                    type="button"
                                    onClick={() => updateStatus(status.value)}
                                    className={[
                                        'rounded-md border p-4 text-left transition hover:shadow-sm',
                                        isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-950 hover:bg-emerald-100' : '',
                                        isRisky ? 'border-destructive/25 bg-destructive/5 text-destructive hover:bg-destructive/10' : '',
                                        !isActive && !isRisky ? 'border-border bg-background hover:bg-muted/40' : '',
                                    ].join(' ')}
                                >
                                    <span className="flex items-center gap-2 text-sm font-semibold">
                                        {isActive ? <CheckCircle2 className="size-4" /> : isRisky ? <Ban className="size-4" /> : <ShieldCheck className="size-4" />}
                                        {prettyStatus(status.value)}
                                    </span>
                                    <span className="mt-1 block text-xs opacity-75">
                                        {isActive ? 'Restore access for this user.' : isRisky ? 'Restrict this user from normal access.' : 'Move this account into a review workflow state.'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setStatusTarget(null)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminUsersIndex.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Users', href: '/admin/users' }] };
