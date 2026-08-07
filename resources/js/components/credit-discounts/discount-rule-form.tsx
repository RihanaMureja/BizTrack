import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';

export type DiscountRule = {
    id?: number;
    name: string;
    spend_threshold: string;
    discount_percent: string;
    is_active: boolean;
};

export function DiscountRuleForm({ rule, onSuccess }: { rule?: DiscountRule | null; onSuccess?: () => void }) {
    const isEditing = Boolean(rule?.id);
    const form = useForm({
        name: rule?.name ?? '',
        spend_threshold: String(rule?.spend_threshold ?? ''),
        discount_percent: String(rule?.discount_percent ?? ''),
        is_active: rule?.is_active ?? true,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onSuccess?.();
            },
        };

        if (isEditing && rule?.id) {
            form.put(`/credit-discounts/rules/${rule.id}`, options);
        } else {
            form.post('/credit-discounts/rules', options);
        }
    };

    return (
        <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="rule_name">Rule name</Label>
                <Input id="rule_name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} placeholder="Loyal monthly buyer" required />
                <InputError message={form.errors.name} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="spend_threshold">Spend threshold</Label>
                    <Input id="spend_threshold" type="number" min="0" step="0.01" value={form.data.spend_threshold} onChange={(event) => form.setData('spend_threshold', event.target.value)} required />
                    <InputError message={form.errors.spend_threshold} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="discount_percent">Discount %</Label>
                    <Input id="discount_percent" type="number" min="0.01" max="100" step="0.01" value={form.data.discount_percent} onChange={(event) => form.setData('discount_percent', event.target.value)} required />
                    <InputError message={form.errors.discount_percent} />
                </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.data.is_active} onChange={(event) => form.setData('is_active', event.target.checked)} />
                Active rule
            </label>
            <Button type="submit" className="w-fit" disabled={form.processing}>
                {form.processing ? <Spinner /> : <Save className="size-4" />}
                {isEditing ? 'Save rule' : 'Create rule'}
            </Button>
        </form>
    );
}
