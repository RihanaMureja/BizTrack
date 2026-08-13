import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export type BusinessFormBusiness = {
    id?: number;
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

export function BusinessForm({ business }: { business: BusinessFormBusiness | null }) {
    const isEditing = Boolean(business?.id);
    const [isPreparingLogo, setIsPreparingLogo] = useState(false);

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
        is_vat_registered: business?.is_vat_registered ?? false,
        vat_certificate: null as File | null,
        has_physical_shop: business?.has_physical_shop ?? false,
        rental_agreement: null as File | null,
        logo: null as File | null,
    });

    const optimizeLogo = async (file: File): Promise<File> => {
        if (file.size <= 1_500_000) {
            return file;
        }

        const objectUrl = URL.createObjectURL(file);

        try {
            const image = await new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = objectUrl;
            });

            const maxDimension = 1600;
            const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
            const width = Math.max(1, Math.round(image.width * scale));
            const height = Math.max(1, Math.round(image.height * scale));

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext('2d');
            if (!context) {
                return file;
            }

            context.drawImage(image, 0, 0, width, height);

            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, 'image/webp', 0.9);
            });

            if (!blob) {
                return file;
            }

            const safeName = file.name.replace(/\.[^.]+$/, '') || 'logo';

            return new File([blob], `${safeName}.webp`, {
                type: 'image/webp',
                lastModified: Date.now(),
            });
        } finally {
            URL.revokeObjectURL(objectUrl);
        }
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = { forceFormData: true };

        if (isEditing) {
            form.post('/business/profile?_method=PUT', options);
        } else {
            form.post('/business/profile', options);
        }
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
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={async (event) => {
                        const file = event.target.files?.[0] ?? null;

                        if (!file) {
                            form.setData('logo', null);
                            return;
                        }

                        setIsPreparingLogo(true);

                        try {
                            form.setData('logo', await optimizeLogo(file));
                        } finally {
                            setIsPreparingLogo(false);
                        }
                    }}
                />
                <p className="text-xs text-muted-foreground">JPG, JPEG, PNG, or WEBP - max 2 MB. Larger images are compressed automatically.</p>
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

            <Button type="submit" className="w-fit" disabled={form.processing || isPreparingLogo}>
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
