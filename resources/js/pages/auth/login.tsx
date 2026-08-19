import { Form, Head } from '@inertiajs/react';
import { LockKeyhole, Mail } from 'lucide-react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { authButtonClass, authIconClass, authInputClass, authLabelClass, authLinkClass } from '@/lib/auth-styles';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            <PasskeyVerify />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className={authLabelClass}>
                                    Email address
                                </Label>
                                <div className="relative">
                                    <Mail className={authIconClass} />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                        className={`${authInputClass} pr-10`}
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password" className={authLabelClass}>
                                    Password
                                </Label>
                                <div className="relative">
                                    <LockKeyhole className="pointer-events-none absolute right-10 top-1/2 size-3.5 -translate-y-1/2 text-[#006b3f]" />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Password"
                                        className={authInputClass}
                                    />
                                </div>
                                <InputError message={errors.password} />
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className={`mt-1 w-fit text-sm ${authLinkClass}`}
                                        tabIndex={5}
                                    >
                                        Forgot password?
                                    </TextLink>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-[#bcd6c8] text-[#006b3f] focus:ring-[#006b3f]/20"
                                />
                                <Label htmlFor="remember" className="text-sm font-normal text-[#607568]">
                                    Remember me
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className={`mx-auto mt-1 w-[150px] ${authButtonClass}`}
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner className="mr-2 size-4" />}
                                Sign in
                            </Button>
                        </div>

                        <div className="text-center text-[13px] text-[#607568]">
                            Don&apos;t have an account?{' '}
                            <TextLink href={register()} tabIndex={5} className={authLinkClass}>
                                Create an account
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 text-center text-sm font-medium text-[#006b3f]">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Welcome Back',
    description: 'Sign in to continue managing your business workspace.',
};
