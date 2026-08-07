import { CustomerTypeFields } from '@/components/customers/customer-type-fields';
import type { CustomerType } from '@/components/customers/customer-type-fields';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';

export type CustomerFormCustomer = {
    id?: number;
    customer_type?: CustomerType;
    display_name?: string;
    full_name?: string;
    contact_person?: string | null;
    contact_person_phone?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
};

type Props = {
    customer: CustomerFormCustomer | null;
    onSuccess?: () => void;
};

export function CustomerForm({ customer, onSuccess }: Props) {
    const isEditing = Boolean(customer?.id);

    const form = useForm({
        customer_type: customer?.customer_type ?? 'individual',
        display_name: customer?.display_name ?? customer?.full_name ?? '',
        contact_person: customer?.contact_person ?? '',
        contact_person_phone: customer?.contact_person_phone ?? '',
        phone: customer?.phone ?? '',
        email: customer?.email ?? '',
        address: customer?.address ?? '',
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
                <CustomerTypeFields
                    type={form.data.customer_type as CustomerType}
                    displayName={form.data.display_name}
                    contactPerson={form.data.contact_person}
                    contactPersonPhone={form.data.contact_person_phone}
                    errors={form.errors}
                    onTypeChange={(value) => form.setData('customer_type', value)}
                    onDisplayNameChange={(value) => form.setData('display_name', value)}
                    onContactPersonChange={(value) => form.setData('contact_person', value)}
                    onContactPersonPhoneChange={(value) => form.setData('contact_person_phone', value)}
                />
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
