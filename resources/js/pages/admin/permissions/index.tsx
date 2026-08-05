import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Head } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';

type PermissionRow = { module: string; permission: string; roles: string[] };
type Props = { permissions: PermissionRow[] };

export default function AdminPermissionsIndex({ permissions }: Props) {
    const columns: DataTableColumn<PermissionRow>[] = [
        { key: 'module', header: 'Module', render: (permission) => <Badge variant="secondary">{permission.module}</Badge> },
        { key: 'permission', header: 'Permission' },
        { key: 'roles', header: 'Roles', render: (permission) => <div className="flex flex-wrap gap-2">{permission.roles.map((role) => <Badge key={role}>{role}</Badge>)}</div> },
    ];

    return (
        <>
            <Head title="Permissions" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm"><KeyRound className="size-5" /></div><div><h1 className="text-xl font-semibold">Permissions</h1><p className="text-sm text-muted-foreground">Review the effective permissions currently enforced by BizTrack policies and middleware.</p></div></div>
                <section className="rounded-md border bg-card p-4 shadow-sm"><DataTable columns={columns} data={permissions} rowKey={(permission) => `${permission.module}-${permission.permission}`} /></section>
            </div>
        </>
    );
}

AdminPermissionsIndex.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Permissions', href: '/admin/permissions' }] };
