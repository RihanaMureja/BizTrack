import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { authButtonClass, authInputClass, authLabelClass } from '@/lib/auth-styles';
import { Head, useForm } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';

type Props = {
    passwordRules: string;
    temporaryPasswordExpiresAt: string | null;
};

export default function ForcePasswordReset({ passwordRules, temporaryPasswordExpiresAt }: Props) {
    const form = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put('/force-password-reset');
    };

    return (
        <>
            <Head title="Reset temporary password" />
            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="flex items-start gap-3 rounded-xl border border-[#d9e8df] bg-[#f7fbf8] p-4">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#006b3f] text-white">
                        <ShieldCheck className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-[#10231a]">Create your permanent password</h1>
                        <p className="mt-1 text-sm text-[#607568]">
                            Your temporary password must be replaced before you can continue using BizTrack.
                        </p>
                        {temporaryPasswordExpiresAt && (
                            <p className="mt-2 text-xs text-[#607568]">
                                Temporary access expires {new Date(temporaryPasswordExpiresAt).toLocaleString()}.
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password" className={authLabelClass}>New password</Label>
                    <PasswordInput
                        id="password"
                        value={form.data.password}
                        onChange={(event) => form.setData('password', event.target.value)}
                        required
                        autoComplete="new-password"
                        passwordrules={passwordRules}
                        className={authInputClass}
                    />
                    <InputError message={form.errors.password} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation" className={authLabelClass}>Confirm password</Label>
                    <PasswordInput
                        id="password_confirmation"
                        value={form.data.password_confirmation}
                        onChange={(event) => form.setData('password_confirmation', event.target.value)}
                        required
                        autoComplete="new-password"
                        passwordrules={passwordRules}
                        className={authInputClass}
                    />
                    <InputError message={form.errors.password_confirmation} />
                </div>

                <Button type="submit" disabled={form.processing} className={`w-full ${authButtonClass}`}>
                    {form.processing && <Spinner />}
                    Reset password
                </Button>
            </form>
        </>
    );
}

ForcePasswordReset.layout = {
    title: 'Temporary Password',
    description: 'Set a strong permanent password for your account.',
};
