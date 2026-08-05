import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Head } from '@inertiajs/react';
import { KeyRound, ShieldCheck } from 'lucide-react';

type RoleRow = { value: string; label: string; users_count: number };
type PermissionRow = { module: string; permission: string; roles: string[] };
type Props = { roles: RoleRow[]; permissions: PermissionRow[] };

export default function AdminRolesIndex({ roles, permissions }: Props) {
    const roleColumns: DataTableColumn<RoleRow>[] = [
        { key: 'label', header: 'Role', render: (role) => <div><p className="font-medium">{role.label}</p><p className="text-xs text-muted-foreground">{role.value}</p></div> },
        { key: 'users_count', header: 'Users', render: (role) => <Badge variant="secondary">{role.users_count}</Badge> },
    ];
    const permissionColumns: DataTableColumn<PermissionRow>[] = [
        { key: 'module', header: 'Module', render: (permission) => <Badge variant="secondary">{permission.module}</Badge> },
        { key: 'permission', header: 'Permission' },
        { key: 'roles', header: 'Roles', render: (permission) => <div className="flex flex-wrap gap-2">{permission.roles.map((role) => <Badge key={role}>{role}</Badge>)}</div> },
    ];

    return (
        <>
            <Head title="Roles & Permissions" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm"><ShieldCheck className="size-5" /></div><div><h1 className="text-xl font-semibold">Roles & Permissions</h1><p className="text-sm text-muted-foreground">Review platform role definitions, assigned user counts, and effective permission coverage.</p></div></div>
                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <ShieldCheck className="size-5 text-primary" />
                        <h2 className="font-semibold">System roles</h2>
                    </div>
                    <DataTable columns={roleColumns} data={roles} rowKey={(role) => role.value} />
                </section>
                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <KeyRound className="size-5 text-primary" />
                        <h2 className="font-semibold">Effective permissions</h2>
                    </div>
                    <DataTable columns={permissionColumns} data={permissions} rowKey={(permission) => `${permission.module}-${permission.permission}`} />
                </section>
            </div>
        </>
    );
}

AdminRolesIndex.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Roles & Permissions', href: '/admin/roles' }] };
