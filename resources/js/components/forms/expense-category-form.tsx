import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';

export type ExpenseCategoryFormCategory = { id?: number; name?: string; description?: string | null };

export function ExpenseCategoryForm({ category, onSuccess }: { category: ExpenseCategoryFormCategory | null; onSuccess?: () => void }) {
    const isEditing = Boolean(category?.id);
    const form = useForm({
        name: category?.name ?? '',
        description: category?.description ?? '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => { form.reset(); onSuccess?.(); } };

        if (isEditing && category?.id) {
            form.put(`/expense-categories/${category.id}`, options);
        } else {
            form.post('/expense-categories', options);
        }
    };

    return (
        <form onSubmit={submit} className="grid gap-5">
            <div className="grid gap-2">
                <Label htmlFor="expense-category-name">Name</Label>
                <Input id="expense-category-name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} required autoFocus />
                <InputError message={form.errors.name} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="expense-category-description">Description</Label>
                <Input id="expense-category-description" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} placeholder="Optional" />
                <InputError message={form.errors.description} />
            </div>
            <Button type="submit" className="w-fit" disabled={form.processing}>
                {form.processing ? <Spinner /> : <Save className="size-4" />}
                {isEditing ? 'Save changes' : 'Create category'}
            </Button>
        </form>
    );
}
