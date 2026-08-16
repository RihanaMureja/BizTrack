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
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="text-xs font-medium text-[#8AA3A0]">
                                    Email address
                                </Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-[#18B6A4]" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                        className="h-10 rounded-none border-x-0 border-t-0 border-b-[#d8ece9] bg-transparent px-0 pr-8 text-sm text-[#071A2B] shadow-none placeholder:text-[#a9c1be] focus-visible:border-b-2 focus-visible:border-[#18B6A4] focus-visible:ring-0"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password" className="text-xs font-medium text-[#8AA3A0]">
                                    Password
                                </Label>
                                <div className="relative">
                                    <LockKeyhole className="pointer-events-none absolute right-8 top-1/2 size-3.5 -translate-y-1/2 text-[#18B6A4]" />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Password"
                                        className="h-10 rounded-none border-x-0 border-t-0 border-b-[#d8ece9] bg-transparent px-0 text-sm text-[#071A2B] shadow-none placeholder:text-[#a9c1be] focus-visible:border-b-2 focus-visible:border-[#18B6A4] focus-visible:ring-0"
                                    />
                                </div>
                                <InputError message={errors.password} />
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="mt-1 w-fit text-sm font-medium text-[#149786] hover:text-[#071A2B]"
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
                                    className="border-slate-300 text-[#20BFA9] focus:ring-[#20BFA9]/20"
                                />
                                <Label htmlFor="remember" className="text-sm font-normal text-slate-600">
                                    Remember me
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mx-auto mt-3 h-11 w-[180px] rounded-full bg-[#18B6A4] text-sm font-semibold text-white shadow-md shadow-[#18B6A4]/25 transition-all hover:-translate-y-0.5 hover:bg-[#149786] hover:shadow-lg hover:shadow-[#18B6A4]/25 active:translate-y-px"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner className="mr-2 size-4" />}
                                Sign in
                            </Button>
                        </div>

                        <div className="text-center text-sm text-slate-500">
                            Don&apos;t have an account?{' '}
                            <TextLink href={register()} tabIndex={5} className="font-semibold text-[#149786] hover:text-[#071A2B]">
                                Create an account
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 text-center text-sm font-medium text-[#16A66A]">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Welcome back',
    description: 'Sign in to continue managing your business with BizTrack.',
};
