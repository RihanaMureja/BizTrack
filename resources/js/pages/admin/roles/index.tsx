import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';

type RoleRow = { value: string; label: string; users_count: number };
type Props = { roles: RoleRow[] };

export default function AdminRolesIndex({ roles }: Props) {
    const columns: DataTableColumn<RoleRow>[] = [
        { key: 'label', header: 'Role', render: (role) => <div><p className="font-medium">{role.label}</p><p className="text-xs text-muted-foreground">{role.value}</p></div> },
        { key: 'users_count', header: 'Users', render: (role) => <Badge variant="secondary">{role.users_count}</Badge> },
    ];

    return (
        <>
            <Head title="Roles" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm"><ShieldCheck className="size-5" /></div><div><h1 className="text-xl font-semibold">Roles</h1><p className="text-sm text-muted-foreground">Review BizTrack role definitions and assigned user counts.</p></div></div>
                <section className="rounded-md border bg-card p-4 shadow-sm"><DataTable columns={columns} data={roles} rowKey={(role) => role.value} /></section>
            </div>
        </>
    );
}

AdminRolesIndex.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Roles', href: '/admin/roles' }] };
