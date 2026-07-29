import { Head, router } from '@inertiajs/react';
import { AlertTriangle, KeyRound, Pencil, Plus, Power, Trash2, UserRoundCog } from 'lucide-react';
import { useState } from 'react';
import { DeleteDialog } from '@/components/confirm-dialog/delete-dialog';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { CashierForm } from '@/components/forms/cashier-form';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Cashier = {
    id: number;
    first_name: string | null;
    last_name: string | null;
    name: string;
    email: string;
    phone: string | null;
    status: 'active' | 'inactive';
    created_at: string;
};

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    cashiers: Paginated<Cashier> | null;
    filters: { search: string | null };
    cashierLimit: number;
};

export default function CashiersIndex({ cashiers, filters, cashierLimit }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingCashier, setEditingCashier] = useState<Cashier | null>(null);
    const [deletingCashier, setDeletingCashier] = useState<Cashier | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const handleSearch = (value: string) => {
        router.get('/cashiers', value ? { search: value } : {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const postAction = (url: string, cashier: Cashier) => {
        setProcessingId(cashier.id);
        router.post(url, {}, { preserveScroll: true, onFinish: () => setProcessingId(null) });
    };

    const confirmDelete = () => {
        if (!deletingCashier) {
            return;
        }

        setProcessingId(deletingCashier.id);
        router.delete(`/cashiers/${deletingCashier.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setProcessingId(null);
                setDeletingCashier(null);
            },
        });
    };

    const columns: DataTableColumn<Cashier>[] = [
        {
            key: 'name',
            header: 'Cashier',
            render: (cashier) => (
                <div>
                    <p className="font-medium">{cashier.name}</p>
                    <p className="text-xs text-muted-foreground">{cashier.email} | {cashier.phone || 'No phone'}</p>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (cashier) => <Badge variant={cashier.status === 'active' ? 'default' : 'secondary'}>{cashier.status}</Badge>,
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (cashier) => (
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="icon" onClick={() => setEditingCashier(cashier)} aria-label={`Edit ${cashier.name}`}>
                        <Pencil className="size-4" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" disabled={processingId === cashier.id} onClick={() => postAction(`/cashiers/${cashier.id}/deactivate`, cashier)} aria-label={`Deactivate ${cashier.name}`}>
                        <Power className="size-4" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" disabled={processingId === cashier.id} onClick={() => postAction(`/cashiers/${cashier.id}/reset-password`, cashier)} aria-label={`Reset ${cashier.name} password`}>
                        <KeyRound className="size-4" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" disabled={processingId === cashier.id} onClick={() => setDeletingCashier(cashier)} aria-label={`Delete ${cashier.name}`}>
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Cashiers" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <UserRoundCog className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">Cashiers</h1>
                            <p className="text-sm text-muted-foreground">Manage cashier accounts, access, and temporary password resets.</p>
                        </div>
                    </div>
                    {cashiers && (
                        <Button type="button" onClick={() => setCreateOpen(true)} disabled={cashierLimit > 0 && cashiers.total >= cashierLimit}>
                            <Plus className="size-4" />
                            New cashier
                        </Button>
                    )}
                </div>

                {cashiers && cashierLimit > 0 && cashiers.total >= cashierLimit && (
                    <Alert>
                        <AlertTriangle />
                        <AlertTitle>Cashier limit reached</AlertTitle>
                        <AlertDescription>Your current subscription allows {cashierLimit} cashier account(s).</AlertDescription>
                    </Alert>
                )}

                {!cashiers ? (
                    <Alert variant="destructive">
                        <AlertTriangle />
                        <AlertTitle>Business profile required</AlertTitle>
                        <AlertDescription>Create your business profile before adding cashiers.</AlertDescription>
                    </Alert>
                ) : (
                    <div className="flex flex-col gap-4">
                        <SearchBox defaultValue={filters.search ?? ''} placeholder="Search cashiers..." onSearch={handleSearch} />
                        <DataTable columns={columns} data={cashiers.data} rowKey={(cashier) => cashier.id} emptyMessage="No cashiers yet. Create one before the POS rollout." />
                        <Pagination links={cashiers.links} from={cashiers.from} to={cashiers.to} total={cashiers.total} />
                    </div>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>New cashier</DialogTitle></DialogHeader>
                    <CashierForm cashier={null} onSuccess={() => setCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(editingCashier)} onOpenChange={(open) => !open && setEditingCashier(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Edit cashier</DialogTitle></DialogHeader>
                    <CashierForm cashier={editingCashier} onSuccess={() => setEditingCashier(null)} />
                </DialogContent>
            </Dialog>

            <DeleteDialog
                open={Boolean(deletingCashier)}
                onOpenChange={(open) => !open && setDeletingCashier(null)}
                itemLabel={deletingCashier?.name ?? 'this cashier'}
                onConfirm={confirmDelete}
                processing={processingId === deletingCashier?.id}
            />
        </>
    );
}

CashiersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Cashiers', href: '/cashiers' },
    ],
};
