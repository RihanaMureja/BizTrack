import InputError from '@/components/input-error';
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import OnboardingLayout from '@/layouts/onboarding-layout';
import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import type React from 'react';

type Business = {
    business_name?: string;
    business_type?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    national_id_fan_number?: string | null;
};

export default function OnboardingBusinessProfile({ business }: { business: Business | null }) {
    const form = useForm({
        business_name: business?.business_name ?? '',
        business_type: business?.business_type ?? '',
        email: business?.email ?? '',
        phone: business?.phone ?? '',
        address: business?.address ?? '',
        national_id_fan_number: business?.national_id_fan_number ?? '',
        national_id_photo: null as File | null,
        trade_license: null as File | null,
        tin_certificate: null as File | null,
        is_vat_registered: false,
        vat_certificate: null as File | null,
        has_physical_shop: false,
        rental_agreement: null as File | null,
        logo: null as File | null,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/onboarding/business-profile', { forceFormData: true });
    };

    return (
        <OnboardingLayout title="Business setup">
            <OnboardingProgress current="business" />
            <form onSubmit={submit} className="rounded-md border bg-card p-5 shadow-sm">
                <h2 className="text-2xl font-semibold">Business profile</h2>
                <p className="mt-2 text-sm text-muted-foreground">Start with the basics. Documents are optional and can be added now or later.</p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <Field label="Business name" error={form.errors.business_name}><Input value={form.data.business_name} onChange={(e) => form.setData('business_name', e.target.value)} required /></Field>
                    <Field label="Business type" error={form.errors.business_type}><Input value={form.data.business_type} onChange={(e) => form.setData('business_type', e.target.value)} placeholder="Retail, pharmacy, cafe..." /></Field>
                    <Field label="Business email" error={form.errors.email}><Input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} /></Field>
                    <Field label="Phone" error={form.errors.phone}><Input value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} placeholder="+251..." /></Field>
                    <Field label="Address" error={form.errors.address}><Input value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} /></Field>
                    <Field label="National ID FAN number" error={form.errors.national_id_fan_number}><Input value={form.data.national_id_fan_number} onChange={(e) => form.setData('national_id_fan_number', e.target.value)} /></Field>
                    <FileField label="Logo" error={form.errors.logo} onChange={(file) => form.setData('logo', file)} accept="image/*" />
                    <FileField label="National ID photo optional" error={form.errors.national_id_photo} onChange={(file) => form.setData('national_id_photo', file)} />
                    <FileField label="Trade license optional" error={form.errors.trade_license} onChange={(file) => form.setData('trade_license', file)} />
                    <FileField label="TIN certificate optional" error={form.errors.tin_certificate} onChange={(file) => form.setData('tin_certificate', file)} />
                    <FileField label="VAT certificate optional" error={form.errors.vat_certificate} onChange={(file) => form.setData('vat_certificate', file)} />
                    <FileField label="Rental agreement optional" error={form.errors.rental_agreement} onChange={(file) => form.setData('rental_agreement', file)} />
                </div>
                <Button className="mt-6" type="submit" disabled={form.processing}>{form.processing && <Spinner />} Continue</Button>
            </form>
        </OnboardingLayout>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return <div className="grid gap-2"><Label>{label}</Label>{children}<InputError message={error} /></div>;
}

function FileField({ label, error, onChange, accept = '.jpg,.jpeg,.png,.pdf' }: { label: string; error?: string; accept?: string; onChange: (file: File | null) => void }) {
    return <Field label={label} error={error}><Input type="file" accept={accept} onChange={(event) => onChange(event.target.files?.[0] ?? null)} /></Field>;
}
