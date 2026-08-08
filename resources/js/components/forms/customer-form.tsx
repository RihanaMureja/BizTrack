import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export type CustomerFormCustomer = {
    id?: number;
    full_name?: string;
    customer_type?: string;
    company_name?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    credit_limit?: string | number;
    default_discount?: string | number;
    current_balance?: string | number;
};

type Props = {
    customer: CustomerFormCustomer | null;
    customerTypes?: Array<{ value: string; label: string }>;
    onSuccess?: () => void;
};

export function CustomerForm({ customer, customerTypes = [], onSuccess }: Props) {
    const isEditing = Boolean(customer?.id);

    const form = useForm({
        full_name: customer?.full_name ?? '',
        customer_type: customer?.customer_type ?? 'retail',
        company_name: customer?.company_name ?? '',
        phone: customer?.phone ?? '',
        email: customer?.email ?? '',
        address: customer?.address ?? '',
        credit_limit: String(customer?.credit_limit ?? 0),
        default_discount: String(customer?.default_discount ?? 0),
        current_balance: String(customer?.current_balance ?? 0),
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

        if (isEditing && customer?.id) {
            form.put(`/customers/${customer.id}`, options);
        } else {
            form.post('/customers', options);
        }
    };

    return (
        <form onSubmit={submit} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="full_name">Full name</Label>
                    <Input id="full_name" value={form.data.full_name} onChange={(event) => form.setData('full_name', event.target.value)} required autoFocus />
                    <InputError message={form.errors.full_name} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="customer_type">Customer type</Label>
                    <select id="customer_type" value={form.data.customer_type} onChange={(event) => form.setData('customer_type', event.target.value)} className="border-input bg-background flex h-9 rounded-md border px-3 text-sm shadow-xs">
                        {customerTypes.length > 0
                            ? customerTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)
                            : <>
                                <option value="retail">Retail</option>
                                <option value="wholesale">Wholesale</option>
                                <option value="corporate">Corporate</option>
                            </>}
                    </select>
                    <InputError message={form.errors.customer_type} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="company_name">Company name</Label>
                    <Input id="company_name" value={form.data.company_name} onChange={(event) => form.setData('company_name', event.target.value)} placeholder="Optional" />
                    <InputError message={form.errors.company_name} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} placeholder="Optional" />
                    <InputError message={form.errors.phone} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} placeholder="Optional" />
                    <InputError message={form.errors.email} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="credit_limit">Credit limit</Label>
                    <Input id="credit_limit" type="number" min="0" step="0.01" value={form.data.credit_limit} onChange={(event) => form.setData('credit_limit', event.target.value)} required />
                    <InputError message={form.errors.credit_limit} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="default_discount">Default discount (%)</Label>
                    <Input id="default_discount" type="number" min="0" max="100" step="0.01" value={form.data.default_discount} onChange={(event) => form.setData('default_discount', event.target.value)} placeholder="0" />
                    <p className="text-xs text-muted-foreground">Applied automatically to this customer's sales when it beats other discounts.</p>
                    <InputError message={form.errors.default_discount} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="current_balance">Current balance</Label>
                    <Input id="current_balance" type="number" min="0" step="0.01" value={form.data.current_balance} onChange={(event) => form.setData('current_balance', event.target.value)} required />
                    <InputError message={form.errors.current_balance} />
                </div>
                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={form.data.address} onChange={(event) => form.setData('address', event.target.value)} placeholder="Optional" />
                    <InputError message={form.errors.address} />
                </div>
            </div>
            <Button type="submit" className="w-fit" disabled={form.processing}>
                {form.processing ? <Spinner /> : <Save className="size-4" />}
                {isEditing ? 'Save changes' : 'Create customer'}
            </Button>
        </form>
    );
}
