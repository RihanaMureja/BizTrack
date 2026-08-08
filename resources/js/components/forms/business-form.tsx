import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

export type BusinessFormBusiness = {
    id?: number;
    subscription_id?: number | null;
    business_name?: string;
    business_type?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    status?: string;
    national_id_fan_number?: string | null;
    national_id_photo_path?: string | null;
    trade_license_path?: string | null;
    tin_certificate_path?: string | null;
    is_vat_registered?: boolean;
    vat_certificate_path?: string | null;
    has_physical_shop?: boolean;
    rental_agreement_path?: string | null;
};

export type BusinessFormSubscription = {
    id: number;
    name: string;
    price: string | number;
    duration_months: number;
    max_cashiers: number;
    description?: string | null;
};

type Props = {
    business: BusinessFormBusiness | null;
    subscriptions: BusinessFormSubscription[];
};

export function BusinessForm({ business, subscriptions }: Props) {
    const form = useForm({
        business_name: business?.business_name ?? '',
        business_type: business?.business_type ?? '',
        subscription_id: business?.subscription_id ? String(business.subscription_id) : '',
        email: business?.email ?? '',
        phone: business?.phone ?? '',
        address: business?.address ?? '',
        national_id_fan_number: business?.national_id_fan_number ?? '',
        national_id_photo: null as File | null,
        trade_license: null as File | null,
        tin_certificate: null as File | null,
        is_vat_registered: business?.is_vat_registered ?? false,
        vat_certificate: null as File | null,
        has_physical_shop: business?.has_physical_shop ?? false,
        rental_agreement: null as File | null,
        logo: null as File | null,
        _method: business?.id ? 'put' : 'post',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/business/profile', { forceFormData: true });
    };

    return (
        <form onSubmit={submit} className="grid gap-5">
            <div className="grid gap-2">
                <Label htmlFor="business_name">Business name</Label>
                <Input
                    id="business_name"
                    value={form.data.business_name}
                    onChange={(event) => form.setData('business_name', event.target.value)}
                    required
                />
                <InputError message={form.errors.business_name} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="business_type">Business type</Label>
                    <Input
                        id="business_type"
                        value={form.data.business_type}
                        onChange={(event) => form.setData('business_type', event.target.value)}
                        placeholder="Retail, service, cafe..."
                    />
                    <InputError message={form.errors.business_type} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        value={form.data.phone}
                        onChange={(event) => form.setData('phone', event.target.value)}
                    />
                    <InputError message={form.errors.phone} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="subscription_id">Subscription plan</Label>
                <Select
                    value={form.data.subscription_id}
                    onValueChange={(value) => form.setData('subscription_id', value)}
                >
                    <SelectTrigger id="subscription_id" className="w-full">
                        <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                        {subscriptions.map((subscription) => (
                            <SelectItem key={subscription.id} value={String(subscription.id)}>
                                {subscription.name} - {Number(subscription.price).toLocaleString()} ETB / month
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={form.errors.subscription_id} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">Business email</Label>
                <Input
                    id="email"
                    type="email"
                    value={form.data.email}
                    onChange={(event) => form.setData('email', event.target.value)}
                />
                <InputError message={form.errors.email} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                    id="address"
                    value={form.data.address}
                    onChange={(event) => form.setData('address', event.target.value)}
                />
                <InputError message={form.errors.address} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="logo">Logo</Label>
                <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(event) => form.setData('logo', event.target.files?.[0] ?? null)}
                />
                <InputError message={form.errors.logo} />
            </div>

            <div className="rounded-md border bg-background p-4">
                <h2 className="font-semibold">Conditional documents</h2>
                <div className="mt-4 grid gap-4">
                    <label className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                        <span>VAT registered business</span>
                        <input
                            type="checkbox"
                            checked={form.data.is_vat_registered}
                            onChange={(event) => form.setData('is_vat_registered', event.target.checked)}
                            className="size-4 accent-primary"
                        />
                    </label>
                    {form.data.is_vat_registered && (
                        <DocumentInput
                            id="vat_certificate"
                            label="VAT certificate"
                            existing={business?.vat_certificate_path}
                            required={!business?.vat_certificate_path}
                            error={form.errors.vat_certificate}
                            onChange={(file) => form.setData('vat_certificate', file)}
                        />
                    )}

                    <label className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                        <span>Business has a physical shop</span>
                        <input
                            type="checkbox"
                            checked={form.data.has_physical_shop}
                            onChange={(event) => form.setData('has_physical_shop', event.target.checked)}
                            className="size-4 accent-primary"
                        />
                    </label>
                    {form.data.has_physical_shop && (
                        <DocumentInput
                            id="rental_agreement"
                            label="Rental agreement / shop ownership proof"
                            existing={business?.rental_agreement_path}
                            required={!business?.rental_agreement_path}
                            error={form.errors.rental_agreement}
                            onChange={(file) => form.setData('rental_agreement', file)}
                        />
                    )}
                </div>
            </div>

            <Button type="submit" className="w-fit" disabled={form.processing}>
                {form.processing ? <Spinner /> : <Save className="size-4" />}
                Save business
            </Button>
        </form>
    );
}

function DocumentInput({
    id,
    label,
    existing,
    required,
    error,
    onChange,
}: {
    id: string;
    label: string;
    existing?: string | null;
    required?: boolean;
    error?: string;
    onChange: (file: File | null) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            {existing && <p className="text-xs text-muted-foreground">Uploaded document on file. Upload a new file only if you need to replace it.</p>}
            <Input
                id={id}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                required={required}
                onChange={(event) => onChange(event.target.files?.[0] ?? null)}
            />
            <InputError message={error} />
        </div>
    );
}
