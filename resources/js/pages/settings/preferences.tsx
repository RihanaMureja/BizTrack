import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { Save, SlidersHorizontal } from 'lucide-react';
import type { FormEvent } from 'react';

type Option = { value: string; label: string };
type Preferences = {
    default_landing_page: string;
    records_per_page: number;
    date_format: string;
    currency: string;
    notify_low_stock: boolean;
    notify_payments: boolean;
    notify_credit_reminders: boolean;
    notify_stagnant_products: boolean;
    stagnant_product_days: number;
    stagnant_product_minimum_stock: number;
    stagnant_product_notification_frequency: number;
    compact_sidebar: boolean;
};
type Props = {
    preferences: Preferences;
    options: {
        landingPages: Option[];
        dateFormats: Option[];
        currencies: Option[];
    };
};

export default function Preferences({ preferences, options }: Props) {
    const form = useForm({
        default_landing_page: preferences.default_landing_page,
        records_per_page: String(preferences.records_per_page),
        date_format: preferences.date_format,
        currency: preferences.currency,
        notify_low_stock: preferences.notify_low_stock,
        notify_payments: preferences.notify_payments,
        notify_credit_reminders: preferences.notify_credit_reminders,
        notify_stagnant_products: preferences.notify_stagnant_products,
        stagnant_product_days: String(preferences.stagnant_product_days),
        stagnant_product_minimum_stock: String(preferences.stagnant_product_minimum_stock),
        stagnant_product_notification_frequency: String(preferences.stagnant_product_notification_frequency),
        compact_sidebar: preferences.compact_sidebar,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put('/settings/preferences', { preserveScroll: true });
    };

    return (
        <>
            <Head title="Preferences" />
            <h1 className="sr-only">Preferences</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Preferences"
                    description="Set account defaults for navigation, display, records, and notifications"
                />

                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-md border bg-card p-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <SlidersHorizontal className="size-5 text-primary" />
                            <h2 className="font-semibold">Workspace defaults</h2>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="default_landing_page">Default landing page</Label>
                                <select
                                    id="default_landing_page"
                                    value={form.data.default_landing_page}
                                    onChange={(event) => form.setData('default_landing_page', event.target.value)}
                                    className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                                >
                                    {options.landingPages.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                                <InputError message={form.errors.default_landing_page} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="records_per_page">Records per page</Label>
                                <Input
                                    id="records_per_page"
                                    type="number"
                                    min="10"
                                    max="100"
                                    value={form.data.records_per_page}
                                    onChange={(event) => form.setData('records_per_page', event.target.value)}
                                />
                                <InputError message={form.errors.records_per_page} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="date_format">Date format</Label>
                                <select
                                    id="date_format"
                                    value={form.data.date_format}
                                    onChange={(event) => form.setData('date_format', event.target.value)}
                                    className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                                >
                                    {options.dateFormats.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                                <InputError message={form.errors.date_format} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="currency">Currency</Label>
                                <select
                                    id="currency"
                                    value={form.data.currency}
                                    onChange={(event) => form.setData('currency', event.target.value)}
                                    className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                                >
                                    {options.currencies.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                                <InputError message={form.errors.currency} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-md border bg-card p-4 shadow-sm">
                        <h2 className="font-semibold">Notification preferences</h2>
                        <div className="mt-4 grid gap-3">
                            <PreferenceToggle label="Low stock alerts" checked={form.data.notify_low_stock} onChange={(checked) => form.setData('notify_low_stock', checked)} />
                            <PreferenceToggle label="Payment notifications" checked={form.data.notify_payments} onChange={(checked) => form.setData('notify_payments', checked)} />
                            <PreferenceToggle label="Credit reminders" checked={form.data.notify_credit_reminders} onChange={(checked) => form.setData('notify_credit_reminders', checked)} />
                            <PreferenceToggle label="Stagnant product alerts" checked={form.data.notify_stagnant_products} onChange={(checked) => form.setData('notify_stagnant_products', checked)} />
                            <PreferenceToggle label="Compact sidebar" checked={form.data.compact_sidebar} onChange={(checked) => form.setData('compact_sidebar', checked)} />
                        </div>
                    </div>

                    <div className="rounded-md border bg-card p-4 shadow-sm">
                        <h2 className="font-semibold">Stagnant product detection</h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="stagnant_product_days">Days without sale</Label>
                                <Input
                                    id="stagnant_product_days"
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={form.data.stagnant_product_days}
                                    onChange={(event) => form.setData('stagnant_product_days', event.target.value)}
                                />
                                <InputError message={form.errors.stagnant_product_days} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="stagnant_product_minimum_stock">Minimum stock</Label>
                                <Input
                                    id="stagnant_product_minimum_stock"
                                    type="number"
                                    min="0"
                                    max="999999"
                                    value={form.data.stagnant_product_minimum_stock}
                                    onChange={(event) => form.setData('stagnant_product_minimum_stock', event.target.value)}
                                />
                                <InputError message={form.errors.stagnant_product_minimum_stock} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="stagnant_product_notification_frequency">Reminder frequency days</Label>
                                <Input
                                    id="stagnant_product_notification_frequency"
                                    type="number"
                                    min="1"
                                    max="90"
                                    value={form.data.stagnant_product_notification_frequency}
                                    onChange={(event) => form.setData('stagnant_product_notification_frequency', event.target.value)}
                                />
                                <InputError message={form.errors.stagnant_product_notification_frequency} />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" disabled={form.processing}>
                        <Save className="size-4" />
                        Save preferences
                    </Button>
                </form>
            </div>
        </>
    );
}

function PreferenceToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <label className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm">
            <span>{label}</span>
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="size-4 accent-primary"
            />
        </label>
    );
}

Preferences.layout = {
    breadcrumbs: [
        {
            title: 'Preferences',
            href: '/settings/preferences',
        },
    ],
};
