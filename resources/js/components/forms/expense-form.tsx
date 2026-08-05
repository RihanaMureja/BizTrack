import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';

export type ExpenseFormExpense = {
    id?: number;
    expense_category_id?: number;
    title?: string;
    amount?: string;
    expense_date?: string;
    status?: string;
    vendor?: string | null;
    notes?: string | null;
};

type Category = { id: number; name: string };
type Status = { value: string; label: string };
type Props = {
    expense: ExpenseFormExpense | null;
    categories: Category[];
    statuses: Status[];
    onSuccess?: () => void;
};

export function ExpenseForm({ expense, categories, statuses, onSuccess }: Props) {
    const isEditing = Boolean(expense?.id);
    const today = new Date().toISOString().slice(0, 10);
    const form = useForm({
        expense_category_id: expense?.expense_category_id ? String(expense.expense_category_id) : '',
        title: expense?.title ?? '',
        amount: expense?.amount ?? '',
        expense_date: expense?.expense_date ?? today,
        status: expense?.status ?? 'approved',
        vendor: expense?.vendor ?? '',
        receipt: null as File | null,
        notes: expense?.notes ?? '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                onSuccess?.();
            },
        };

        if (isEditing && expense?.id) {
            form.post(`/expenses/${expense.id}?_method=PUT`, options);
        } else {
            form.post('/expenses', options);
        }
    };

    return (
        <form onSubmit={submit} className="grid gap-5">
            <div className="grid gap-2">
                <Label htmlFor="expense_category_id">Category</Label>
                <select id="expense_category_id" value={form.data.expense_category_id} onChange={(event) => form.setData('expense_category_id', event.target.value)} className="border-input bg-background h-10 rounded-md border px-3 text-sm" required>
                    <option value="">Choose category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                <InputError message={form.errors.expense_category_id} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} required />
                    <InputError message={form.errors.title} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" min="0.01" step="0.01" value={form.data.amount} onChange={(event) => form.setData('amount', event.target.value)} required />
                    <InputError message={form.errors.amount} />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="expense_date">Expense date</Label>
                    <Input id="expense_date" type="date" value={form.data.expense_date} onChange={(event) => form.setData('expense_date', event.target.value)} required />
                    <InputError message={form.errors.expense_date} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <select id="status" value={form.data.status} onChange={(event) => form.setData('status', event.target.value)} className="border-input bg-background h-10 rounded-md border px-3 text-sm" required>
                        {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                    </select>
                    <InputError message={form.errors.status} />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="vendor">Vendor</Label>
                    <Input id="vendor" value={form.data.vendor} onChange={(event) => form.setData('vendor', event.target.value)} placeholder="Optional" />
                    <InputError message={form.errors.vendor} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="receipt">Receipt</Label>
                    <Input id="receipt" type="file" accept=".jpg,.jpeg,.png,.pdf,.webp" onChange={(event) => form.setData('receipt', event.target.files?.[0] ?? null)} />
                    <InputError message={form.errors.receipt} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea id="notes" value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} className="border-input bg-background min-h-24 rounded-md border px-3 py-2 text-sm" placeholder="Optional" />
                <InputError message={form.errors.notes} />
            </div>

            <Button type="submit" className="w-fit" disabled={form.processing}>
                {form.processing ? <Spinner /> : <Save className="size-4" />}
                {isEditing ? 'Save changes' : 'Record expense'}
            </Button>
        </form>
    );
}
