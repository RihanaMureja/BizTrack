import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import InputError from '@/components/input-error';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Permission = { id: number; key: string; name: string; group: string; description: string | null };
type BusinessRole = {
    id: number;
    name: string;
    description: string | null;
    is_default: boolean;
    users_count: number;
    permissions_count: number;
    permissions?: Permission[];
};
type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Props = {
    roles: Paginated<BusinessRole> | null;
    permissions: Permission[];
    filters: { search: string | null };
};

export default function BusinessRolesIndex({ roles, permissions, filters }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<BusinessRole | null>(null);

    const columns: DataTableColumn<BusinessRole>[] = [
        { key: 'name', header: 'Role', render: (role) => <div><p className="font-medium">{role.name}</p><p className="text-xs text-muted-foreground">{role.description ?? 'No description'}</p></div> },
        { key: 'permissions_count', header: 'Permissions' },
        { key: 'users_count', header: 'Employees' },
        { key: 'is_default', header: 'Default', render: (role) => role.is_default ? <Badge>Default</Badge> : <Badge variant="secondary">Custom</Badge> },
        { key: 'actions', header: '', className: 'text-right', render: (role) => <Button type="button" variant="outline" size="icon" onClick={() => { setEditing(role); setOpen(true); }}><Pencil className="size-4" /></Button> },
    ];

    return (
        <>
            <Head title="Employee Roles" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm"><ShieldCheck className="size-5" /></div>
                        <div><h1 className="text-xl font-semibold">Employee Roles</h1><p className="text-sm text-muted-foreground">Create custom employee roles and decide which modules they can access.</p></div>
                    </div>
                    <Button type="button" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="size-4" /> New role</Button>
                </div>

                <SearchBox defaultValue={filters.search ?? ''} placeholder="Search roles..." onSearch={(search) => router.get('/business-roles', search ? { search } : {}, { preserveState: true, preserveScroll: true, replace: true })} />

                {roles ? (
                    <section className="rounded-md border bg-card p-4 shadow-sm">
                        <DataTable columns={columns} data={roles.data} rowKey={(role) => role.id} emptyMessage="No employee roles yet." />
                        <div className="mt-4"><Pagination links={roles.links} from={roles.from} to={roles.to} total={roles.total} /></div>
                    </section>
                ) : (
                    <section className="rounded-md border bg-card p-5 text-sm text-muted-foreground shadow-sm">Create your business profile before managing employee roles.</section>
                )}
            </div>

            <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setEditing(null); }}>
                <DialogContent className="max-h-[85vh] max-w-3xl grid-rows-[auto_minmax(0,1fr)]">
                    <DialogHeader><DialogTitle>{editing ? 'Edit role' : 'New role'}</DialogTitle></DialogHeader>
                    <div className="min-h-0 overflow-y-auto pr-1">
                        <RoleForm role={editing} permissions={permissions} onSuccess={() => { setOpen(false); setEditing(null); }} />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function RoleForm({ role, permissions, onSuccess }: { role: BusinessRole | null; permissions: Permission[]; onSuccess: () => void }) {
    const form = useForm({
        name: role?.name ?? '',
        description: role?.description ?? '',
        is_default: role?.is_default ?? false,
        permission_ids: role?.permissions?.map((permission) => permission.id) ?? [],
    });

    const grouped = permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
        groups[permission.group] = [...(groups[permission.group] ?? []), permission];
        return groups;
    }, {});

    const togglePermission = (id: number) => {
        form.setData('permission_ids', form.data.permission_ids.includes(id)
            ? form.data.permission_ids.filter((permissionId) => permissionId !== id)
            : [...form.data.permission_ids, id]);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess };
        role ? form.put(`/business-roles/${role.id}`, options) : form.post('/business-roles', options);
    };

    return (
        <form onSubmit={submit} className="grid gap-5">
            <div className="grid gap-2">
                <Label htmlFor="role-name">Role name</Label>
                <Input id="role-name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} required placeholder="Manager, Inventory Staff, Accountant..." />
                <InputError message={form.errors.name} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="role-description">Description</Label>
                <Input id="role-description" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />
                <InputError message={form.errors.description} />
            </div>
            <label className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>Use as default role for new employees</span>
                <input type="checkbox" checked={form.data.is_default} onChange={(event) => form.setData('is_default', event.target.checked)} className="size-4 accent-primary" />
            </label>
            <div className="grid gap-4">
                {Object.entries(grouped).map(([group, groupPermissions]) => (
                    <div key={group} className="rounded-md border p-3">
                        <h3 className="text-sm font-semibold">{group}</h3>
                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                            {groupPermissions.map((permission) => (
                                <label key={permission.id} className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={form.data.permission_ids.includes(permission.id)} onChange={() => togglePermission(permission.id)} className="size-4 accent-primary" />
                                    <span>{permission.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <InputError message={form.errors.permission_ids} />
            <Button type="submit" disabled={form.processing} className="w-fit">{role ? 'Save role' : 'Create role'}</Button>
        </form>
    );
}

BusinessRolesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Employee Roles', href: '/business-roles' },
    ],
};
