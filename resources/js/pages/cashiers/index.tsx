import { DeleteDialog } from '@/components/confirm-dialog/delete-dialog';
import { IconButton } from '@/components/buttons/icon-button';
import { CashierForm } from '@/components/forms/cashier-form';
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
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    KeyRound,
    Pencil,
    Plus,
    Power,
    Receipt,
    Trash2,
    UserRoundCog,
} from 'lucide-react';
import { useState } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

type Cashier = {
    id: number;
    business_role_id: number | null;
    first_name: string | null;
    last_name: string | null;
    name: string;
    email: string;
    phone: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    sales_count_30d?: number;
    sales_total_30d?: string | number | null;
    sales_sparkline?: Array<{ label: string; value: number }>;
    business_role: {
        id: number;
        name: string;
        permissions?: Array<{ key: string; name: string; group: string }>;
    } | null;
};
type BusinessRole = { id: number; name: string; is_default: boolean };

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
    passwordRules: string;
    businessRoles: BusinessRole[];
};

export default function CashiersIndex({
    cashiers,
    filters,
    cashierLimit,
    passwordRules,
    businessRoles,
}: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingCashier, setEditingCashier] = useState<Cashier | null>(null);
    const [deletingCashier, setDeletingCashier] = useState<Cashier | null>(
        null,
    );
    const [processingId, setProcessingId] = useState<number | null>(null);

    const handleSearch = (value: string) => {
        router.get('/cashiers', value ? { search: value } : {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const postAction = (url: string, cashier: Cashier) => {
        setProcessingId(cashier.id);
        router.post(
            url,
            {},
            { preserveScroll: true, onFinish: () => setProcessingId(null) },
        );
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

    return (
        <>
            <Head title="Employees" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <UserRoundCog className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">Employees</h1>
                            <p className="text-sm text-muted-foreground">
                                Manage employee accounts, access roles, status,
                                and temporary password resets.
                            </p>
                        </div>
                    </div>
                    {cashiers && (
                        <Button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            disabled={
                                cashierLimit > 0 &&
                                cashiers.total >= cashierLimit
                            }
                        >
                            <Plus className="size-4" />
                            New employee
                        </Button>
                    )}
                </div>

                {cashiers &&
                    cashierLimit > 0 &&
                    cashiers.total >= cashierLimit && (
                        <Alert>
                            <AlertTriangle />
                            <AlertTitle>Employee limit reached</AlertTitle>
                            <AlertDescription>
                                Your current subscription allows {cashierLimit}{' '}
                                employee account(s).
                            </AlertDescription>
                        </Alert>
                    )}

                {!cashiers ? (
                    <Alert variant="destructive">
                        <AlertTriangle />
                        <AlertTitle>Business profile required</AlertTitle>
                        <AlertDescription>
                            Create your business profile before adding
                            employees.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="flex flex-col gap-4">
                        <SearchBox
                            defaultValue={filters.search ?? ''}
                            placeholder="Search employees..."
                            onSearch={handleSearch}
                        />
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {cashiers.data.map((cashier) => (
                                <EmployeeCard
                                    key={cashier.id}
                                    cashier={cashier}
                                    processing={processingId === cashier.id}
                                    onEdit={setEditingCashier}
                                    onDeactivate={(employee) =>
                                        postAction(
                                            `/cashiers/${employee.id}/deactivate`,
                                            employee,
                                        )
                                    }
                                    onReset={(employee) =>
                                        postAction(
                                            `/cashiers/${employee.id}/reset-password`,
                                            employee,
                                        )
                                    }
                                    onDelete={setDeletingCashier}
                                />
                            ))}
                        </div>
                        {cashiers.data.length === 0 && (
                            <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
                                No employees yet. Create one before assigning
                                operational access.
                            </div>
                        )}
                        <Pagination
                            links={cashiers.links}
                            from={cashiers.from}
                            to={cashiers.to}
                            total={cashiers.total}
                        />
                    </div>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>New employee</DialogTitle>
                    </DialogHeader>
                    <CashierForm
                        cashier={null}
                        onSuccess={() => setCreateOpen(false)}
                        passwordRules={passwordRules}
                        businessRoles={businessRoles}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={Boolean(editingCashier)}
                onOpenChange={(open) => !open && setEditingCashier(null)}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit employee</DialogTitle>
                    </DialogHeader>
                    <CashierForm
                        cashier={editingCashier}
                        onSuccess={() => setEditingCashier(null)}
                        passwordRules={passwordRules}
                        businessRoles={businessRoles}
                    />
                </DialogContent>
            </Dialog>

            <DeleteDialog
                open={Boolean(deletingCashier)}
                onOpenChange={(open) => !open && setDeletingCashier(null)}
                itemLabel={deletingCashier?.name ?? 'this employee'}
                onConfirm={confirmDelete}
                processing={processingId === deletingCashier?.id}
            />
        </>
    );
}

function EmployeeCard({
    cashier,
    processing,
    onEdit,
    onDeactivate,
    onReset,
    onDelete,
}: {
    cashier: Cashier;
    processing: boolean;
    onEdit: (cashier: Cashier) => void;
    onDeactivate: (cashier: Cashier) => void;
    onReset: (cashier: Cashier) => void;
    onDelete: (cashier: Cashier) => void;
}) {
    const performance = cashier.sales_sparkline ?? [];
    const canSell =
        cashier.business_role?.permissions?.some((permission) =>
            ['create_sales', 'view_sales'].includes(permission.key),
        ) ?? /cashier|sales|pos/i.test(cashier.business_role?.name ?? '');
    const salesTotal = Number(cashier.sales_total_30d ?? 0);

    return (
        <article className="rounded-xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                        {initials(cashier.name)}
                    </div>
                    <div>
                        <h3 className="font-semibold">{cashier.name}</h3>
                        <p className="text-xs text-muted-foreground">
                            {cashier.email}
                        </p>
                    </div>
                </div>
                <Badge
                    variant={
                        cashier.status === 'active' ? 'default' : 'secondary'
                    }
                >
                    {cashier.status}
                </Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="mt-1 text-sm font-medium">
                        {cashier.business_role?.name ?? 'Default role'}
                    </p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="mt-1 text-sm font-medium">
                        {cashier.phone || 'No phone'}
                    </p>
                </div>
            </div>
            <div className="mt-4 rounded-lg border bg-background p-3">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                        {canSell
                            ? 'Sales performance preview'
                            : 'Activity preview'}
                    </p>
                    <Receipt className="size-4 text-primary" />
                </div>
                <div className="mt-2 h-16">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performance}>
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="var(--primary)"
                                strokeWidth={2.5}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>
                        {canSell
                            ? `${cashier.sales_count_30d ?? 0} sales in 30 days`
                            : 'No sales permission'}
                    </span>
                    <span>
                        {canSell
                            ? `${salesTotal.toFixed(2)} ETB`
                            : 'Performance by assigned modules'}
                    </span>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                <IconButton
                    variant="outline"
                    icon={Pencil}
                    label={`Edit ${cashier.name}`}
                    onClick={() => onEdit(cashier)}
                />
                <IconButton
                    variant="outline"
                    icon={Power}
                    label={`${cashier.status === 'active' ? 'Deactivate' : 'Activate'} ${cashier.name}`}
                    disabled={processing}
                    onClick={() => onDeactivate(cashier)}
                />
                <IconButton
                    variant="outline"
                    icon={KeyRound}
                    label={`Reset password for ${cashier.name}`}
                    disabled={processing}
                    onClick={() => onReset(cashier)}
                />
                <IconButton
                    variant="outline"
                    icon={Trash2}
                    label={`Delete ${cashier.name}`}
                    disabled={processing}
                    onClick={() => onDelete(cashier)}
                />
            </div>
        </article>
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

CashiersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Employees', href: '/cashiers' },
    ],
};
