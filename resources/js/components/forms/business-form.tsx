import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import {
    Building2,
    Laptop,
    Pill,
    Scissors,
    Shirt,
    ShoppingBag,
    ShoppingBasket,
    Sparkles,
    Store,
    Truck,
    Utensils,
    Save,
} from 'lucide-react';
import type { ComponentType, FormEvent } from 'react';
import { useState } from 'react';

export type BusinessFormBusiness = {
    id?: number;
    business_name?: string;
    business_type?: string | null;
    business_category?: string | null;
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
    businessCategories?: Array<{ value: string; label: string }>;
    action?: string;
};

const fallbackCategories = [
    { value: 'retail_shop', label: 'Retail shop' },
    { value: 'supermarket', label: 'Supermarket' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'boutique', label: 'Boutique' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'cosmetics', label: 'Cosmetics' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'service_business', label: 'Service business' },
    { value: 'online_store', label: 'Online store' },
    { value: 'other', label: 'Other' },
];

const categoryDetails: Record<string, { description: string; icon: ComponentType<{ className?: string }> }> = {
    retail_shop: { description: 'Daily sales, shelves, and customer walk-ins.', icon: Store },
    supermarket: { description: 'High-volume items, cashiers, and stock flow.', icon: ShoppingBasket },
    pharmacy: { description: 'Medicine inventory, expiry tracking, and receipts.', icon: Pill },
    boutique: { description: 'Fashion items, sizes, styles, and repeat buyers.', icon: Shirt },
    restaurant: { description: 'Fast sales, daily expenses, and staff access.', icon: Utensils },
    electronics: { description: 'Catalog items, warranties, and price control.', icon: Laptop },
    cosmetics: { description: 'Beauty products, bundles, and customer loyalty.', icon: Sparkles },
    wholesale: { description: 'Bulk stock movement and larger customer accounts.', icon: Truck },
    service_business: { description: 'Service revenue, expenses, and customer records.', icon: Scissors },
    online_store: { description: 'Online orders, stock visibility, and payments.', icon: ShoppingBag },
    other: { description: 'Use a custom category for this business.', icon: Building2 },
};

export function BusinessForm({ business, businessCategories = fallbackCategories, action = '/settings/business' }: Props) {
    const form = useForm({
        business_name: business?.business_name ?? '',
        business_type: business?.business_category === 'other' ? (business?.business_type ?? '') : '',
        business_category: business?.business_category ?? 'retail_shop',
        logo: null as File | null,
        _method: business?.id ? 'put' : 'post',
    });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [customCategory, setCustomCategory] = useState(form.data.business_type);
    const [customCategoryError, setCustomCategoryError] = useState('');

    const selectCategory = (value: string) => {
        if (value === 'other') {
            setCustomCategory(form.data.business_type);
            setCustomCategoryError('');
            setDialogOpen(true);
            return;
        }

        form.setData((data) => ({
            ...data,
            business_category: value,
            business_type: '',
        }));
        form.clearErrors('business_category', 'business_type');
    };

    const confirmCustomCategory = () => {
        const value = customCategory.trim();

        if (!value) {
            setCustomCategoryError('Please enter your business category.');
            return;
        }

        form.setData((data) => ({
            ...data,
            business_category: 'other',
            business_type: value,
        }));
        form.clearErrors('business_category', 'business_type');
        setDialogOpen(false);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (!form.data.business_name.trim()) {
            form.setError('business_name', 'Please enter your business name.');
            return;
        }

        if (form.data.business_category === 'other' && !form.data.business_type.trim()) {
            setDialogOpen(true);
            form.setError('business_type', 'Please enter your business category.');
            return;
        }

        form.post(action, { forceFormData: true });
    };

    return (
        <>
            <form onSubmit={submit} noValidate className="grid gap-7">
                <div>
                    <h2 className="font-semibold">Business profile</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Keep the profile simple. More operational settings live in their own sections.
                    </p>
                </div>

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

                <div>
                    <Label>Business category</Label>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {businessCategories.map(({ value, label }) => {
                            const details = categoryDetails[value] ?? categoryDetails.other;
                            const Icon = details.icon;
                            const selected = form.data.business_category === value;

                            return (
                                <button
                                    key={value}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => selectCategory(value)}
                                    className={cn(
                                        'group flex min-h-28 flex-col items-start gap-3 rounded-lg border p-4 text-left transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                                        selected
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'border-border bg-background hover:border-primary/40 hover:bg-accent',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex size-10 items-center justify-center rounded-md transition',
                                            selected
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
                                        )}
                                    >
                                        <Icon className="size-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold">{label}</div>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{details.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {form.data.business_category === 'other' && form.data.business_type && (
                        <p className="mt-3 text-sm text-muted-foreground">
                            Custom category: <span className="font-semibold text-foreground">{form.data.business_type}</span>
                        </p>
                    )}
                    <InputError message={form.errors.business_category ?? form.errors.business_type} className="mt-2" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="logo">Business logo optional</Label>
                    <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={(event) => form.setData('logo', event.target.files?.[0] ?? null)}
                    />
                    <p className="text-xs text-muted-foreground">
                        Upload a logo to refresh the sidebar identity and business color palette.
                    </p>
                    <InputError message={form.errors.logo} />
                </div>

                <Button type="submit" className="w-fit" disabled={form.processing}>
                    {form.processing ? <Spinner /> : <Save className="size-4" />}
                    Save business
                </Button>
            </form>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Enter your business category</DialogTitle>
                        <DialogDescription>
                            Add your own category if the listed options do not describe this business.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="custom_business_category">Business category</Label>
                        <Input
                            id="custom_business_category"
                            value={customCategory}
                            onChange={(event) => {
                                setCustomCategory(event.target.value);
                                setCustomCategoryError('');
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    confirmCustomCategory();
                                }
                            }}
                            placeholder="e.g. Bakery, furniture shop, auto parts..."
                            autoFocus
                        />
                        {customCategoryError && <InputError message={customCategoryError} />}
                    </div>

                    <DialogFooter>
                        <Button type="button" onClick={confirmCustomCategory} className="w-full sm:w-auto">
                            Use this category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
