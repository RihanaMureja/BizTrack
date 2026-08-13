import InputError from '@/components/input-error';
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import OnboardingLayout from '@/layouts/onboarding-layout';
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
} from 'lucide-react';
import type { ComponentType, FormEvent } from 'react';
import { useState } from 'react';

type Business = {
    business_name?: string;
    business_type?: string | null;
    business_category?: string | null;
    logo?: string | null;
};

type BusinessCategory = { value: string; label: string };

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
    other: { description: 'Tell us your own category and BizTrack will adapt.', icon: Building2 },
};

export default function OnboardingBusinessProfile({ business, businessCategories }: { business: Business | null; businessCategories: BusinessCategory[] }) {
    const form = useForm({
        business_name: business?.business_name ?? '',
        business_category: business?.business_category ?? 'retail_shop',
        business_type: business?.business_category === 'other' ? (business?.business_type ?? '') : '',
        logo: null as File | null,
    });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [customCategory, setCustomCategory] = useState(form.data.business_type);
    const [customCategoryError, setCustomCategoryError] = useState('');

    const isCustomCategory = form.data.business_category === 'other' && Boolean(form.data.business_type);

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

        form.post('/onboarding/business-profile', { forceFormData: true });
    };

    return (
        <OnboardingLayout title="Business setup">
            <OnboardingProgress current="business" />

            <section className="rounded-xl border bg-card p-5 shadow-sm md:p-8">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-sm font-medium text-primary">One quick setup step</p>
                    <h1 className="mt-2 text-2xl font-semibold">Set up your business</h1>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Add the essentials now. Documents, VAT, address, and other profile details can be completed later from Settings.
                    </p>
                </div>

                <form onSubmit={submit} noValidate className="mt-8 grid gap-8">
                    <div className="mx-auto grid w-full max-w-md gap-2">
                        <Label htmlFor="business_name">Business name</Label>
                        <Input
                            id="business_name"
                            type="text"
                            required
                            autoFocus
                            value={form.data.business_name}
                            onChange={(event) => form.setData('business_name', event.target.value)}
                            placeholder="e.g. Merkato Fresh Mart"
                        />
                        <InputError message={form.errors.business_name} />
                    </div>

                    <div>
                        <Label>Choose your business category</Label>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                                            'group flex min-h-32 flex-col items-start gap-3 rounded-lg border p-4 text-left transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
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

                        {isCustomCategory && (
                            <p className="mt-3 text-sm text-muted-foreground">
                                Custom category: <span className="font-semibold text-foreground">{form.data.business_type}</span>
                            </p>
                        )}
                        <InputError message={form.errors.business_category ?? form.errors.business_type} className="mt-2" />
                    </div>

                    <div className="mx-auto grid w-full max-w-md gap-2">
                        <Label htmlFor="logo">Business logo optional</Label>
                        <Input
                            id="logo"
                            type="file"
                            accept="image/*"
                            onChange={(event) => form.setData('logo', event.target.files?.[0] ?? null)}
                        />
                        <p className="text-xs text-muted-foreground">
                            You can skip this now. Adding a logo later can help BizTrack match your brand colors.
                        </p>
                        <InputError message={form.errors.logo} />
                    </div>

                    <div className="flex justify-center">
                        <Button type="submit" className="w-full max-w-md" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Continue to phone verification
                        </Button>
                    </div>
                </form>
            </section>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Enter your business category</DialogTitle>
                        <DialogDescription>
                            If your category is not listed, add your own so BizTrack can label and tailor the workspace better.
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
        </OnboardingLayout>
    );
}
