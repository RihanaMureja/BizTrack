import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';

export type CashierFormCashier = {
    id?: number;
    business_role_id?: number | null;
    first_name?: string | null;
    last_name?: string | null;
    name?: string;
    email?: string;
    phone?: string | null;
    status?: string;
};

export type CashierBusinessRole = {
    id: number;
    name: string;
    is_default: boolean;
};

type Props = {
    cashier: CashierFormCashier | null;
    onSuccess?: () => void;
    passwordRules?: string;
    businessRoles?: CashierBusinessRole[];
};

export function CashierForm({ cashier, onSuccess, passwordRules, businessRoles = [] }: Props) {
    const isEditing = Boolean(cashier?.id);
    const form = useForm({
        first_name: cashier?.first_name ?? '',
        last_name: cashier?.last_name ?? '',
        name: cashier?.name ?? '',
        email: cashier?.email ?? '',
        business_role_id: cashier?.business_role_id ? String(cashier.business_role_id) : String(businessRoles.find((role) => role.is_default)?.id ?? businessRoles[0]?.id ?? ''),
        phone: cashier?.phone ?? '',
        status: cashier?.status ?? 'active',
        password: '',
        password_confirmation: '',
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

        if (isEditing && cashier?.id) {
            form.put(`/cashiers/${cashier.id}`, options);
        } else {
            form.post('/cashiers', options);
        }
    };

    return (
        <form onSubmit={submit} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="first_name">First name</Label>
                    <Input id="first_name" value={form.data.first_name} onChange={(event) => form.setData('first_name', event.target.value)} required autoFocus />
                    <InputError message={form.errors.first_name} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="last_name">Last name</Label>
                    <Input id="last_name" value={form.data.last_name} onChange={(event) => form.setData('last_name', event.target.value)} placeholder="Optional" />
                    <InputError message={form.errors.last_name} />
                </div>
                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="name">Display name</Label>
                    <Input id="name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} required />
                    <InputError message={form.errors.name} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} required />
                    <InputError message={form.errors.email} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} placeholder="Optional" />
                    <InputError message={form.errors.phone} />
                </div>
                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="business_role_id">Employee role</Label>
                    <select id="business_role_id" value={form.data.business_role_id} onChange={(event) => form.setData('business_role_id', event.target.value)} className="border-input bg-background flex h-9 rounded-md border px-3 text-sm shadow-xs">
                        <option value="">Use default role</option>
                        {businessRoles.map((role) => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                    <InputError message={form.errors.business_role_id} />
                </div>
                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="status">Status</Label>
                    <select id="status" value={form.data.status} onChange={(event) => form.setData('status', event.target.value)} className="border-input bg-background flex h-9 rounded-md border px-3 text-sm shadow-xs">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <InputError message={form.errors.status} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">{isEditing ? 'New temporary password' : 'Temporary password'}</Label>
                    <PasswordInput id="password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} required={!isEditing} placeholder={isEditing ? 'Leave unchanged' : undefined} passwordrules={passwordRules} />
                    <InputError message={form.errors.password} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">Confirm password</Label>
                    <PasswordInput id="password_confirmation" value={form.data.password_confirmation} onChange={(event) => form.setData('password_confirmation', event.target.value)} required={!isEditing} passwordrules={passwordRules} />
                    <InputError message={form.errors.password_confirmation} />
                </div>
            </div>

            <Button type="submit" className="w-fit" disabled={form.processing}>
                {form.processing ? <Spinner /> : <Save className="size-4" />}
                {isEditing ? 'Save changes' : 'Create employee'}
            </Button>
        </form>
    );
}
