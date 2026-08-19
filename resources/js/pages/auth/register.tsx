import { Form, Head } from '@inertiajs/react';
import { LockKeyhole, Mail, Phone, UserRound } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { authButtonClass, authIconClass, authInputClass, authLabelClass, authLinkClass } from '@/lib/auth-styles';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#006b3f]">
                                    Personal information
                                </p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="first_name" className={authLabelClass}>
                                            First name
                                        </Label>
                                        <div className="relative">
                                            <UserRound className={authIconClass} />
                                            <Input
                                                id="first_name"
                                                type="text"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="given-name"
                                                name="first_name"
                                                placeholder="First name"
                                                className={`${authInputClass} pr-10`}
                                            />
                                        </div>
                                        <InputError
                                            message={errors.first_name}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="last_name" className={authLabelClass}>
                                            Last name
                                        </Label>
                                        <div className="relative">
                                            <UserRound className={authIconClass} />
                                            <Input
                                                id="last_name"
                                                type="text"
                                                required
                                                tabIndex={2}
                                                autoComplete="family-name"
                                                name="last_name"
                                                placeholder="Last name"
                                                className={`${authInputClass} pr-10`}
                                            />
                                        </div>
                                        <InputError
                                            message={errors.last_name}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#006b3f]">
                                    Contact information
                                </p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="phone" className={authLabelClass}>
                                            Phone
                                        </Label>
                                        <div className="relative">
                                            <Phone className={authIconClass} />
                                            <Input
                                                id="phone"
                                                type="text"
                                                tabIndex={3}
                                                autoComplete="tel"
                                                name="phone"
                                                placeholder="+251..."
                                                className={`${authInputClass} pr-10`}
                                            />
                                        </div>
                                        <InputError message={errors.phone} />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="email" className={authLabelClass}>
                                            Email address
                                        </Label>
                                        <div className="relative">
                                            <Mail className={authIconClass} />
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                tabIndex={4}
                                                autoComplete="email"
                                                name="email"
                                                placeholder="email@example.com"
                                                className={`${authInputClass} pr-10`}
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#006b3f]">
                                    Security
                                </p>
                                <div className="grid gap-3">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="password" className={authLabelClass}>
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <LockKeyhole className="pointer-events-none absolute right-10 top-1/2 size-3.5 -translate-y-1/2 text-[#006b3f]" />
                                            <PasswordInput
                                                id="password"
                                                required
                                                tabIndex={5}
                                                autoComplete="new-password"
                                                name="password"
                                                placeholder="Password"
                                                passwordrules={passwordRules}
                                                className={authInputClass}
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="password_confirmation" className={authLabelClass}>
                                            Confirm password
                                        </Label>
                                        <div className="relative">
                                            <LockKeyhole className="pointer-events-none absolute right-10 top-1/2 size-3.5 -translate-y-1/2 text-[#006b3f]" />
                                            <PasswordInput
                                                id="password_confirmation"
                                                required
                                                tabIndex={6}
                                                autoComplete="new-password"
                                                name="password_confirmation"
                                                placeholder="Confirm password"
                                                passwordrules={passwordRules}
                                                className={authInputClass}
                                            />
                                        </div>
                                        <InputError
                                            message={errors.password_confirmation}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className={`mx-auto mt-1 w-[150px] ${authButtonClass}`}
                                tabIndex={7}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner className="mr-2 size-4" />}
                                Continue
                            </Button>
                        </div>

                        <div className="text-center text-[13px] text-[#607568]">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={8} className={authLinkClass}>
                                Sign in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create Account',
    description: 'Start your BizTrack workspace with a secure owner account.',
};
