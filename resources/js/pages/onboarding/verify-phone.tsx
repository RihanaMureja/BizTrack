import InputError from '@/components/input-error';
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import OnboardingLayout from '@/layouts/onboarding-layout';
import { useForm } from '@inertiajs/react';
import { KeyRound, Smartphone } from 'lucide-react';
import type { FormEvent } from 'react';

export default function VerifyPhone({ phone, devOtp }: { phone: string | null; devOtp?: string | null }) {
    const form = useForm({ phone: phone ?? '', code: '' });

    const send = (event: FormEvent) => {
        event.preventDefault();
        form.post('/onboarding/verify-phone/send', { preserveScroll: true });
    };

    const verify = (event: FormEvent) => {
        event.preventDefault();
        form.post('/onboarding/verify-phone/confirm', { preserveScroll: true });
    };

    return (
        <OnboardingLayout title="Verify phone">
            <OnboardingProgress current="phone" />
            <section className="rounded-md border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Smartphone className="size-5" /></div>
                    <div>
                        <h2 className="text-2xl font-semibold">Verify owner phone</h2>
                        <p className="text-sm text-muted-foreground">Phone OTP is the only gate for starting a free trial.</p>
                    </div>
                </div>

                <form onSubmit={send} className="mt-6 grid gap-3">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input id="phone" value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} placeholder="+251..." required />
                    <InputError message={form.errors.phone} />
                    <Button type="submit" variant="outline" className="w-fit" disabled={form.processing}>{form.processing && <Spinner />} Send code</Button>
                </form>

                {devOtp && (
                    <div className="mt-5 flex items-start gap-3 rounded-md border border-primary/25 bg-primary/5 p-4 text-sm">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <KeyRound className="size-4" />
                        </div>
                        <div>
                            <p className="font-medium">Local development verification code</p>
                            <p className="mt-1 text-2xl font-semibold tracking-[0.2em] text-primary">{devOtp}</p>
                            <p className="mt-1 text-muted-foreground">Use this code below. In production this will be sent by SMS.</p>
                        </div>
                    </div>
                )}

                <form onSubmit={verify} className="mt-8 grid gap-3 border-t pt-6">
                    <Label htmlFor="code">Verification code</Label>
                    <Input id="code" value={form.data.code} onChange={(event) => form.setData('code', event.target.value)} placeholder="6-digit code" required />
                    <InputError message={form.errors.code} />
                    <Button type="submit" className="w-fit" disabled={form.processing}>{form.processing && <Spinner />} Verify and continue</Button>
                </form>
            </section>
        </OnboardingLayout>
    );
}
