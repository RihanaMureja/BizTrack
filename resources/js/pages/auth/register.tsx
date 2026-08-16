import { Form, Head } from '@inertiajs/react';
import { LockKeyhole, Mail, Phone, UserRound } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
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
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8AA3A0]">
                                    Personal information
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="first_name" className="text-xs font-medium text-[#8AA3A0]">
                                            First name
                                        </Label>
                                        <div className="relative">
                                            <UserRound className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-[#18B6A4]" />
                                            <Input
                                                id="first_name"
                                                type="text"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="given-name"
                                                name="first_name"
                                                placeholder="First name"
                                                className="h-10 rounded-none border-x-0 border-t-0 border-b-[#d8ece9] bg-transparent px-0 pr-7 text-sm text-[#071A2B] shadow-none placeholder:text-[#a9c1be] focus-visible:border-b-2 focus-visible:border-[#18B6A4] focus-visible:ring-0"
                                            />
                                        </div>
                                        <InputError
                                            message={errors.first_name}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="last_name" className="text-xs font-medium text-[#8AA3A0]">
                                            Last name
                                        </Label>
                                        <div className="relative">
                                            <UserRound className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-[#18B6A4]" />
                                            <Input
                                                id="last_name"
                                                type="text"
                                                required
                                                tabIndex={2}
                                                autoComplete="family-name"
                                                name="last_name"
                                                placeholder="Last name"
                                                className="h-10 rounded-none border-x-0 border-t-0 border-b-[#d8ece9] bg-transparent px-0 pr-7 text-sm text-[#071A2B] shadow-none placeholder:text-[#a9c1be] focus-visible:border-b-2 focus-visible:border-[#18B6A4] focus-visible:ring-0"
                                            />
                                        </div>
                                        <InputError
                                            message={errors.last_name}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8AA3A0]">
                                    Contact information
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="phone" className="text-xs font-medium text-[#8AA3A0]">
                                            Phone
                                        </Label>
                                        <div className="relative">
                                            <Phone className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-[#18B6A4]" />
                                            <Input
                                                id="phone"
                                                type="text"
                                                tabIndex={3}
                                                autoComplete="tel"
                                                name="phone"
                                                placeholder="+251..."
                                                className="h-10 rounded-none border-x-0 border-t-0 border-b-[#d8ece9] bg-transparent px-0 pr-7 text-sm text-[#071A2B] shadow-none placeholder:text-[#a9c1be] focus-visible:border-b-2 focus-visible:border-[#18B6A4] focus-visible:ring-0"
                                            />
                                        </div>
                                        <InputError message={errors.phone} />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="email" className="text-xs font-medium text-[#8AA3A0]">
                                            Email address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-[#18B6A4]" />
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                tabIndex={4}
                                                autoComplete="email"
                                                name="email"
                                                placeholder="email@example.com"
                                                className="h-10 rounded-none border-x-0 border-t-0 border-b-[#d8ece9] bg-transparent px-0 pr-7 text-sm text-[#071A2B] shadow-none placeholder:text-[#a9c1be] focus-visible:border-b-2 focus-visible:border-[#18B6A4] focus-visible:ring-0"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8AA3A0]">
                                    Security
                                </p>
                                <div className="grid gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="password" className="text-xs font-medium text-[#8AA3A0]">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <LockKeyhole className="pointer-events-none absolute right-8 top-1/2 size-3.5 -translate-y-1/2 text-[#18B6A4]" />
                                            <PasswordInput
                                                id="password"
                                                required
                                                tabIndex={5}
                                                autoComplete="new-password"
                                                name="password"
                                                placeholder="Password"
                                                passwordrules={passwordRules}
                                                className="h-10 rounded-none border-x-0 border-t-0 border-b-[#d8ece9] bg-transparent px-0 text-sm text-[#071A2B] shadow-none placeholder:text-[#a9c1be] focus-visible:border-b-2 focus-visible:border-[#18B6A4] focus-visible:ring-0"
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="password_confirmation" className="text-xs font-medium text-[#8AA3A0]">
                                            Confirm password
                                        </Label>
                                        <div className="relative">
                                            <LockKeyhole className="pointer-events-none absolute right-8 top-1/2 size-3.5 -translate-y-1/2 text-[#18B6A4]" />
                                            <PasswordInput
                                                id="password_confirmation"
                                                required
                                                tabIndex={6}
                                                autoComplete="new-password"
                                                name="password_confirmation"
                                                placeholder="Confirm password"
                                                passwordrules={passwordRules}
                                                className="h-10 rounded-none border-x-0 border-t-0 border-b-[#d8ece9] bg-transparent px-0 text-sm text-[#071A2B] shadow-none placeholder:text-[#a9c1be] focus-visible:border-b-2 focus-visible:border-[#18B6A4] focus-visible:ring-0"
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
                                className="mx-auto mt-2 h-11 w-[180px] rounded-full bg-[#18B6A4] text-sm font-semibold text-white shadow-md shadow-[#18B6A4]/25 transition-all hover:-translate-y-0.5 hover:bg-[#149786] hover:shadow-lg hover:shadow-[#18B6A4]/25 active:translate-y-px"
                                tabIndex={7}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner className="mr-2 size-4" />}
                                Continue
                            </Button>
                        </div>

                        <div className="text-center text-sm text-slate-500">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={8} className="font-semibold text-[#149786] hover:text-[#071A2B]">
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
    title: 'Create your BizTrack account',
    description: 'Start managing your business with one powerful platform.',
};
