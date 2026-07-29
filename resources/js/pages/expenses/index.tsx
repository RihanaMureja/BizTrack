import { DeleteDialog } from '@/components/confirm-dialog/delete-dialog';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { ExpenseCategoryForm } from '@/components/forms/expense-category-form';
import { ExpenseForm } from '@/components/forms/expense-form';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, FileText, Pencil, Plus, Tags, Trash2, WalletCards } from 'lucide-react';
import { useState } from 'react';

type ExpenseCategory = { id: number; name: string; description: string | null; expenses_count: number };
type Expense = {
    id: number;
    expense_category_id: number;
    title: string;
    amount: string;
    expense_date: string;
    status: string;
    vendor: string | null;
    receipt_path: string | null;
    notes: string | null;
    category: { name: string } | null;
    user: { name: string } | null;
};
type Status = { value: string; label: string };
type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Props = {
    expenses: Paginated<Expense> | null;
    categories: ExpenseCategory[];
    statuses: Status[];
    total: string;
    filters: { search: string | null; category_id: number | null; date_from: string | null; date_to: string | null };
};

const statusVariant = (status: string) => {
    if (status === 'paid' || status === 'approved') return 'default';
    if (status === 'rejected') return 'destructive';
    return 'secondary';
};

export default function ExpensesIndex({ expenses, categories, statuses, total, filters }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
    const [deleting, setDeleting] = useState(false);

    const applyFilters = (next: Record<string, string | number | null>) => {
        const params = {
            search: filters.search ?? '',
            category_id: filters.category_id ?? '',
            date_from: filters.date_from ?? '',
            date_to: filters.date_to ?? '',
            ...next,
        };
        router.get('/expenses', params, { preserveState: true, preserveScroll: true, replace: true });
    };

    const confirmDelete = () => {
        if (!deletingExpense) return;
        setDeleting(true);
        router.delete(`/expenses/${deletingExpense.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeletingExpense(null);
            },
        });
    };

    const columns: DataTableColumn<Expense>[] = [
        {
            key: 'title',
            header: 'Expense',
            render: (expense) => (
                <div>
                    <p className="font-medium">{expense.title}</p>
                    <p className="text-xs text-muted-foreground">{expense.vendor || 'No vendor'} | {expense.user?.name ?? 'System'}</p>
                </div>
            ),
        },
        { key: 'category', header: 'Category', render: (expense) => expense.category?.name ?? 'Uncategorized' },
        { key: 'expense_date', header: 'Date' },
        { key: 'amount', header: 'Amount', render: (expense) => `${expense.amount} ETB` },
        { key: 'status', header: 'Status', render: (expense) => <Badge variant={statusVariant(expense.status)}>{expense.status}</Badge> },
        {
            key: 'receipt_path',
            header: 'Receipt',
            render: (expense) => expense.receipt_path ? <a className="text-primary underline" href={`/storage/${expense.receipt_path}`} target="_blank">View</a> : <span className="text-muted-foreground">None</span>,
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (expense) => (
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="icon" onClick={() => setEditingExpense(expense)} aria-label={`Edit ${expense.title}`}>
                        <Pencil className="size-4" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={() => setDeletingExpense(expense)} aria-label={`Delete ${expense.title}`}>
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Expenses" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <WalletCards className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">Expenses</h1>
                            <p className="text-sm text-muted-foreground">Record business costs, organize categories, and track receipts.</p>
                        </div>
                    </div>
                    {expenses && (
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="outline" onClick={() => setCategoryOpen(true)}>
                                <Tags className="size-4" />
                                Category
                            </Button>
                            <Button type="button" onClick={() => setCreateOpen(true)}>
                                <Plus className="size-4" />
                                New expense
                            </Button>
                        </div>
                    )}
                </div>

                {!expenses ? (
                    <Alert variant="destructive">
                        <AlertTriangle />
                        <AlertTitle>Business profile required</AlertTitle>
                        <AlertDescription>Create your business profile before recording expenses.</AlertDescription>
                    </Alert>
                ) : (
                    <>
                        <div className="grid gap-3 rounded-md border bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_12rem_10rem_10rem]">
                            <SearchBox defaultValue={filters.search ?? ''} placeholder="Search title, vendor, category..." onSearch={(search) => applyFilters({ search })} />
                            <select value={filters.category_id ?? ''} onChange={(event) => applyFilters({ category_id: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                                <option value="">All categories</option>
                                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                            </select>
                            <input type="date" value={filters.date_from ?? ''} onChange={(event) => applyFilters({ date_from: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm" />
                            <input type="date" value={filters.date_to ?? ''} onChange={(event) => applyFilters({ date_to: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm" />
                        </div>

                        <div className="flex items-center justify-between rounded-md border bg-card p-4 shadow-sm">
                            <div>
                                <p className="text-sm text-muted-foreground">Filtered total</p>
                                <p className="text-2xl font-semibold">{total} ETB</p>
                            </div>
                            <FileText className="size-8 text-primary" />
                        </div>

                        <DataTable columns={columns} data={expenses.data} rowKey={(expense) => expense.id} emptyMessage="No expenses match the current filters." />
                        <Pagination links={expenses.links} from={expenses.from} to={expenses.to} total={expenses.total} />
                    </>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>New expense</DialogTitle></DialogHeader>
                    <ExpenseForm expense={null} categories={categories} statuses={statuses} onSuccess={() => setCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(editingExpense)} onOpenChange={(open) => !open && setEditingExpense(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Edit expense</DialogTitle></DialogHeader>
                    <ExpenseForm expense={editingExpense} categories={categories} statuses={statuses} onSuccess={() => setEditingExpense(null)} />
                </DialogContent>
            </Dialog>

            <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>New expense category</DialogTitle></DialogHeader>
                    <ExpenseCategoryForm category={null} onSuccess={() => setCategoryOpen(false)} />
                </DialogContent>
            </Dialog>

            <DeleteDialog open={Boolean(deletingExpense)} onOpenChange={(open) => !open && setDeletingExpense(null)} itemLabel={deletingExpense?.title ?? 'this expense'} onConfirm={confirmDelete} processing={deleting} />
        </>
    );
}

ExpensesIndex.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Expenses', href: '/expenses' }] };
