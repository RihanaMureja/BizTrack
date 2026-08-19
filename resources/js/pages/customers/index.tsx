import { DeleteDialog } from '@/components/confirm-dialog/delete-dialog';
import { IconButton } from '@/components/buttons/icon-button';
import { CustomerForm } from '@/components/forms/customer-form';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CreditCard,
    Eye,
    Pencil,
    Plus,
    ShoppingBag,
    Trash2,
    Users,
    WalletCards,
} from 'lucide-react';
import { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

type Customer = {
    id: number;
    customer_type: 'individual' | 'company' | 'government' | 'other';
    display_name: string;
    full_name: string;
    contact_person: string | null;
    contact_person_phone: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    credit_limit: string;
    current_balance: string;
    sales_count?: number;
    sales_total?: string | number | null;
    last_purchase_at?: string | null;
    purchase_sparkline?: Array<{ label: string; value: number }>;
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
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(
        null,
    );
    const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(
        null,
    );
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
                            <p className="text-sm text-muted-foreground">
                                Manage customer records, contact details, and
                                credit balances.
                            </p>
                        </div>
                    </div>
                    {customers && (
                        <Button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus className="size-4" />
                            New customer
                        </Button>
                    )}
                </div>

                {!customers ? (
                    <Alert variant="destructive">
                        <AlertTriangle />
                        <AlertTitle>Business profile required</AlertTitle>
                        <AlertDescription>
                            Create or assign a business before managing
                            customers.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="flex flex-col gap-4">
                        <SearchBox
                            defaultValue={filters.search ?? ''}
                            placeholder="Search name, phone, or email..."
                            onSearch={handleSearch}
                        />
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {customers.data.map((customer) => (
                                <CustomerCard
                                    key={customer.id}
                                    customer={customer}
                                    onEdit={setEditingCustomer}
                                    onDelete={setDeletingCustomer}
                                />
                            ))}
                        </div>
                        {customers.data.length === 0 && (
                            <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
                                No customers yet. Add the first customer to
                                prepare sales and credit tracking.
                            </div>
                        )}
                        <Pagination
                            links={customers.links}
                            from={customers.from}
                            to={customers.to}
                            total={customers.total}
                        />
                    </div>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>New customer</DialogTitle>
                    </DialogHeader>
                    <CustomerForm
                        customer={null}
                        onSuccess={() => setCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={Boolean(editingCustomer)}
                onOpenChange={(open) => !open && setEditingCustomer(null)}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit customer</DialogTitle>
                    </DialogHeader>
                    <CustomerForm
                        customer={editingCustomer}
                        onSuccess={() => setEditingCustomer(null)}
                    />
                </DialogContent>
            </Dialog>

            <DeleteDialog
                open={Boolean(deletingCustomer)}
                onOpenChange={(open) => !open && setDeletingCustomer(null)}
                itemLabel={deletingCustomer?.display_name ?? 'this customer'}
                onConfirm={confirmDelete}
                processing={deleting}
            />
        </>
    );
}

function CustomerCard({
    customer,
    onEdit,
    onDelete,
}: {
    customer: Customer;
    onEdit: (customer: Customer) => void;
    onDelete: (customer: Customer) => void;
}) {
    const creditLimit = Number(customer.credit_limit || 0);
    const balance = Number(customer.current_balance || 0);
    const availableCredit = Math.max(creditLimit - balance, 0);
    const creditUsage =
        creditLimit > 0 ? Math.min((balance / creditLimit) * 100, 100) : 0;
    const purchaseTotal = Number(customer.sales_total ?? 0);
    const sparkline = customer.purchase_sparkline ?? [];

    return (
        <article className="rounded-xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                        {initials(customer.display_name)}
                    </div>
                    <div>
                        <h3 className="font-semibold">
                            {customer.display_name}
                        </h3>
                        <p className="text-xs text-muted-foreground capitalize">
                            {customer.customer_type.replace('_', ' ')}
                        </p>
                    </div>
                </div>
                <Badge variant={balance > 0 ? 'secondary' : 'default'}>
                    {balance > 0 ? 'Credit open' : 'Clear'}
                </Badge>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoTile
                    label="Phone"
                    value={
                        customer.phone ||
                        customer.contact_person_phone ||
                        'No phone'
                    }
                    icon={Users}
                />
                <InfoTile
                    label="Purchases"
                    value={`${customer.sales_count ?? 0} sales`}
                    icon={ShoppingBag}
                />
                <InfoTile
                    label="Total spent"
                    value={`${purchaseTotal.toFixed(2)} ETB`}
                    icon={WalletCards}
                />
                <InfoTile
                    label="Available credit"
                    value={`${availableCredit.toFixed(2)} ETB`}
                    icon={CreditCard}
                />
            </div>

            <div className="mt-4 rounded-xl border bg-background p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Credit usage</span>
                    <span>{creditUsage.toFixed(0)}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                    <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${creditUsage}%` }}
                    />
                </div>
            </div>

            <div className="mt-4 rounded-xl border bg-background p-3">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                        7-day purchase history
                    </p>
                    <span className="text-xs text-muted-foreground">
                        {customer.last_purchase_at
                            ? 'Recent buyer'
                            : 'No purchases yet'}
                    </span>
                </div>
                <div className="mt-2 h-20">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparkline}>
                            <defs>
                                <linearGradient
                                    id={`customer-purchase-${customer.id}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="var(--primary)"
                                        stopOpacity={0.28}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--primary)"
                                        stopOpacity={0.03}
                                    />
                                </linearGradient>
                            </defs>
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="var(--primary)"
                                strokeWidth={2.5}
                                fill={`url(#customer-purchase-${customer.id})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" size="sm" asChild>
                    <Link href={`/customers/${customer.id}`}>
                        <Eye className="size-4" />
                        View
                    </Link>
                </Button>
                <IconButton
                    variant="outline"
                    icon={Pencil}
                    label={`Edit ${customer.display_name}`}
                    onClick={() => onEdit(customer)}
                />
                <IconButton
                    variant="outline"
                    icon={Trash2}
                    label={`Delete ${customer.display_name}`}
                    onClick={() => onDelete(customer)}
                />
            </div>
        </article>
    );
}

function InfoTile({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: typeof Users;
}) {
    return (
        <div className="rounded-lg border bg-background p-3">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <Icon className="size-3.5 text-primary" />
            </div>
            <p className="mt-1 truncate text-sm font-medium">{value}</p>
        </div>
    );
}

function initials(name: string) {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

CustomersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Customers', href: '/customers' },
    ],
};
