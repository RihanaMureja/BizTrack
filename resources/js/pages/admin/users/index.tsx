import { Head, router } from '@inertiajs/react';
import { CheckCircle2, CirclePause, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type User = { id: number; first_name: string | null; last_name: string | null; email: string; role: string; role_label: string; status: string; created_at: string; business: { business_name: string } | null };
type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Option = { value: string; label: string };
type Props = { users: Paginated<User>; roles: Option[]; statuses: Option[]; filters: { search: string | null; role: string | null; status: string | null }; currentUserId: number };

const prettyStatus = (status: string) => (status === 'active' ? 'Active' : 'Inactive');
const statusVariant = (status: string) => status === 'active' ? 'default' : 'secondary';
const roleVariant = (role: string) => role === 'super_admin' ? 'default' : role === 'owner' ? 'secondary' : 'outline';

export default function AdminUsersIndex({ users, roles, statuses, filters, currentUserId }: Props) {
    const [statusTarget, setStatusTarget] = useState<User | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const applyFilters = (next: Record<string, string | null>) => router.get('/admin/users', { search: filters.search ?? '', role: filters.role ?? '', status: filters.status ?? '', ...next }, { preserveState: true, preserveScroll: true, replace: true });
    const statusOptions = statuses.filter((status) => status.value !== statusTarget?.status);
    const openStatusDialog = (user: User) => {
        setStatusTarget(user);
        setSelectedStatus('');
    };
    const updateStatus = () => {
        if (!statusTarget || !selectedStatus) {
            return;
        }

        router.put(`/admin/users/${statusTarget.id}`, { status: selectedStatus }, {
            preserveScroll: true,
            onSuccess: () => {
                setStatusTarget(null);
                setSelectedStatus('');
            },
        });
    };
    const columns: DataTableColumn<User>[] = [
        { key: 'email', header: 'User', render: (user) => <div><p className="font-medium">{[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email}</p><p className="text-xs text-muted-foreground">{user.email}</p></div> },
        { key: 'business', header: 'Business', render: (user) => user.business?.business_name ?? 'Platform' },
        { key: 'role', header: 'Role', render: (user) => <Badge variant={roleVariant(user.role)}>{user.role_label}</Badge> },
        { key: 'status', header: 'Status', render: (user) => <Badge variant={statusVariant(user.status)}>{prettyStatus(user.status)}</Badge> },
        { key: 'created_at', header: 'Registration Date', render: (user) => new Date(user.created_at).toLocaleDateString() },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (user) => {
                const locked = user.role === 'super_admin' || user.id === currentUserId || user.role === 'cashier';

                return locked ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <ShieldCheck className="size-3.5" /> {user.role === 'cashier' ? 'Owner managed' : 'Protected'}
                    </span>
                ) : (
                    <Button type="button" variant="outline" size="sm" onClick={() => openStatusDialog(user)}>
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

            <Dialog open={Boolean(statusTarget)} onOpenChange={(open) => {
                if (!open) {
                    setStatusTarget(null);
                    setSelectedStatus('');
                }
            }}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Update account status</DialogTitle>
                        <DialogDescription>
                            Choose the next status for {statusTarget?.email}. Role changes are intentionally unavailable from this screen.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-wrap gap-2 rounded-md border bg-muted/30 p-2">
                        {statusOptions.map((status) => {
                            const style = statusStyle(status.value);
                            const Icon = style.Icon;
                            const active = selectedStatus === status.value;

                            return (
                                <button
                                    key={status.value}
                                    type="button"
                                    onClick={() => setSelectedStatus(status.value)}
                                    className={[
                                        'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition',
                                        active ? style.activeClass : style.idleClass,
                                    ].join(' ')}
                                >
                                    <Icon className="size-4" />
                                    {prettyStatus(status.value)}
                                </button>
                            );
                        })}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => {
                            setStatusTarget(null);
                            setSelectedStatus('');
                        }}>Cancel</Button>
                        <Button type="button" onClick={updateStatus} disabled={!selectedStatus}>Confirm status</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminUsersIndex.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Users', href: '/admin/users' }] };

function statusStyle(status: string): { Icon: typeof CheckCircle2; activeClass: string; idleClass: string } {
    if (status === 'active') {
        return {
            Icon: CheckCircle2,
            activeClass: 'border-emerald-600 bg-emerald-600 text-white shadow-sm',
            idleClass: 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
        };
    }

    return {
        Icon: CirclePause,
        activeClass: 'border-slate-700 bg-slate-700 text-white shadow-sm',
        idleClass: 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
    };
}
