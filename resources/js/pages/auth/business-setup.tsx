import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { businessTypes } from '@/lib/business-types';
import { cn } from '@/lib/utils';

export default function BusinessSetup() {
    const form = useForm({
        business_name: '',
        business_type: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (!form.data.business_type) {
            form.setError('business_type', 'Please select your business type.');

            return;
        }

        form.post('/business/setup');
    };

    return (
        <>
            <Head title="Set up your business" />

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
                                const selected = form.data.business_type === value;

                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => {
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
                        <InputError message={form.errors.business_type} className="mt-2" />
                    </div>

                    <div className="flex justify-center">
                        <Button type="submit" className="w-full max-w-md" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Continue
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

BusinessSetup.layout = {
    title: 'Set up your business',
    description: 'One quick step and you are on your way',
};
