import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Eye, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { DeleteDialog } from '@/components/confirm-dialog/delete-dialog';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { CustomerForm } from '@/components/forms/customer-form';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Customer = {
    id: number;
    full_name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    credit_limit: string;
    current_balance: string;
};

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    customers: Paginated<Customer> | null;
    filters: {
        search: string | null;
    };
};

export default function CustomersIndex({ customers, filters }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleSearch = (value: string) => {
        router.get('/customers', value ? { search: value } : {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const confirmDelete = () => {
        if (!deletingCustomer) {
            return;
        }

        setDeleting(true);
        router.delete(`/customers/${deletingCustomer.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeletingCustomer(null);
            },
        });
    };

    const columns: DataTableColumn<Customer>[] = [
        {
            key: 'full_name',
            header: 'Customer',
            render: (customer) => (
                <div>
                    <p className="font-medium">{customer.full_name}</p>
                    <p className="text-xs text-muted-foreground">{customer.phone || 'No phone'} | {customer.email || 'No email'}</p>
                </div>
            ),
        },
        {
            key: 'credit_limit',
            header: 'Credit limit',
            render: (customer) => `${customer.credit_limit} ETB`,
        },
        {
            key: 'current_balance',
            header: 'Balance',
            render: (customer) => (
                <Badge variant={Number(customer.current_balance) > 0 ? 'secondary' : 'default'}>
                    {customer.current_balance} ETB
                </Badge>
            ),
        },
        {
            key: 'address',
            header: 'Address',
            render: (customer) => <span className="text-muted-foreground">{customer.address || 'No address'}</span>,
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (customer) => (
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="icon" asChild>
                        <Link href={`/customers/${customer.id}`} aria-label={`View ${customer.full_name}`}>
                            <Eye className="size-4" />
                        </Link>
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={() => setEditingCustomer(customer)} aria-label={`Edit ${customer.full_name}`}>
                        <Pencil className="size-4" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={() => setDeletingCustomer(customer)} aria-label={`Delete ${customer.full_name}`}>
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Customers" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <Users className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">Customers</h1>
                            <p className="text-sm text-muted-foreground">Manage customer records, contact details, and credit balances.</p>
                        </div>
                    </div>
                    {customers && (
                        <Button type="button" onClick={() => setCreateOpen(true)}>
                            <Plus className="size-4" />
                            New customer
                        </Button>
                    )}
                </div>

                {!customers ? (
                    <Alert variant="destructive">
                        <AlertTriangle />
                        <AlertTitle>Business profile required</AlertTitle>
                        <AlertDescription>Create or assign a business before managing customers.</AlertDescription>
                    </Alert>
                ) : (
                    <div className="flex flex-col gap-4">
                        <SearchBox defaultValue={filters.search ?? ''} placeholder="Search name, phone, or email..." onSearch={handleSearch} />
                        <DataTable columns={columns} data={customers.data} rowKey={(customer) => customer.id} emptyMessage="No customers yet. Add the first customer to prepare sales and credit tracking." />
                        <Pagination links={customers.links} from={customers.from} to={customers.to} total={customers.total} />
                    </div>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>New customer</DialogTitle></DialogHeader>
                    <CustomerForm customer={null} onSuccess={() => setCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(editingCustomer)} onOpenChange={(open) => !open && setEditingCustomer(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Edit customer</DialogTitle></DialogHeader>
                    <CustomerForm customer={editingCustomer} onSuccess={() => setEditingCustomer(null)} />
                </DialogContent>
            </Dialog>

            <DeleteDialog
                open={Boolean(deletingCustomer)}
                onOpenChange={(open) => !open && setDeletingCustomer(null)}
                itemLabel={deletingCustomer?.full_name ?? 'this customer'}
                onConfirm={confirmDelete}
                processing={deleting}
            />
        </>
    );
}

CustomersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Customers', href: '/customers' },
    ],
};
