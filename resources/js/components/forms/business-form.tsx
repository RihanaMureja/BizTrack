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

            <Button type="submit" className="w-fit" disabled={form.processing}>
                {form.processing ? <Spinner /> : <Save className="size-4" />}
                Save business
            </Button>
        </form>
    );
}
