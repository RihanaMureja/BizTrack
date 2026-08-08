import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
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
import { businessTypes } from '@/lib/business-types';
import { cn } from '@/lib/utils';
import { login } from '@/routes';

export default function BusinessSetup() {
    const form = useForm({
        business_name: '',
        business_type: '',
    });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [customTypeInput, setCustomTypeInput] = useState('');
    const [customTypeError, setCustomTypeError] = useState('');

    const isCustomType =
        form.data.business_type !== '' &&
        !businessTypes.some((type) => type.value === form.data.business_type);

    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            router.visit(login());
        }
    };

    const openCustomTypeDialog = () => {
        setCustomTypeInput(isCustomType ? form.data.business_type : '');
        setCustomTypeError('');
        setDialogOpen(true);
    };

    const confirmCustomType = () => {
        const value = customTypeInput.trim();

        if (!value) {
            setCustomTypeError('Please enter your business type.');

            return;
        }

        form.setData('business_type', value);
        form.clearErrors('business_type');
        setDialogOpen(false);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (!form.data.business_name.trim()) {
            form.setError('business_name', 'Please enter your business name.');

            return;
        }

        if (!form.data.business_type) {
            form.setError('business_type', 'Please select your business type.');

            return;
        }

        form.post('/business/setup');
    };

    return (
        <>
            <Head title="Set up your business" />

            <div className="mb-4 flex">
                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={goBack}
                    aria-label="Go back"
                    title="Go back"
                >
                    <ArrowLeft className="size-4" />
                </Button>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold">Set up your business</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Tell us about your business so we can tailor BizTrack to your needs.
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
                        <InputError message={form.errors.business_name} className="mt-2" />
                    </div>

                    <div>
                        <Label>What type of business do you run?</Label>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {businessTypes.map(({ value, label, description, icon: Icon }) => {
                                const isOther = value === 'other';
                                const selected =
                                    (isOther ? form.data.business_type === 'other' || isCustomType : form.data.business_type === value);

                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => {
                                            if (isOther) {
                                                openCustomTypeDialog();

                                                return;
                                            }

                                            form.setData('business_type', value);
                                            form.clearErrors('business_type');
                                        }}
                                        className={cn(
                                            'group flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                                            selected
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                : 'border-border bg-background hover:border-primary/40 hover:bg-accent',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'flex size-10 items-center justify-center rounded-md transition-colors',
                                                selected
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
                                            )}
                                        >
                                            <Icon className="size-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">{label}</div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {isCustomType && (
                            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                <BadgeCheck className="size-4 shrink-0 text-primary" />
                                Selected business type:
                                <span className="font-semibold text-foreground">
                                    {form.data.business_type}
                                </span>
                            </p>
                        )}
                        <InputError message={form.errors.business_type} className="mt-2" />
                    </div>

                    <div className="flex justify-center">
                        <Button type="submit" className="w-full max-w-md" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Next
                        </Button>
                    </div>
                </form>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Enter Your Business Type</DialogTitle>
                        <DialogDescription>
                            Your business type is not in the list. Type your own so we can tailor
                            BizTrack to your needs.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="custom_business_type">Business Type</Label>
                        <Input
                            id="custom_business_type"
                            value={customTypeInput}
                            onChange={(event) => {
                                setCustomTypeInput(event.target.value);
                                setCustomTypeError('');
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    confirmCustomType();
                                }
                            }}
                            placeholder="e.g. Bakery, Furniture Shop, Auto Parts..."
                            autoFocus
                        />
                        {customTypeError && <InputError message={customTypeError} />}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={confirmCustomType}
                            className="w-full sm:w-auto"
                        >
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

BusinessSetup.layout = {
    title: 'Set up your business',
    description: 'One quick step and you are on your way',
};
