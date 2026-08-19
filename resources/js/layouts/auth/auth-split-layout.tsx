import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { home, login } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({ children }: AuthLayoutProps) {
    const { component, props } = usePage();
    const { name } = props;
    const isRegistration = component === 'auth/register';
    const isForgotPassword = component === 'auth/forgot-password';
    const title = isRegistration
        ? 'Create Your Account'
        : isForgotPassword
          ? 'Forgot Password'
          : 'Welcome Back';
    const description = isRegistration
        ? 'Start managing your business with BizTrack.'
        : isForgotPassword
          ? 'Enter your email to receive a password reset link.'
          : 'Sign in to continue to BizTrack.';

    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();
            return;
        }

        router.visit(isForgotPassword ? login() : home());
    };

    return (
        <main className="auth-soft relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
            <div aria-hidden="true" className="auth-soft-glow auth-soft-glow-one" />
            <div aria-hidden="true" className="auth-soft-glow auth-soft-glow-two" />

            <section className={`auth-soft-card relative z-10 w-full ${isRegistration ? 'max-w-[540px]' : 'max-w-[420px]'}`}>
                <div className={`relative px-5 py-6 sm:px-7 sm:py-7 ${isRegistration ? 'max-h-[calc(100dvh-3rem)] overflow-y-auto' : ''}`}>
                    <button type="button" onClick={goBack} className="auth-soft-back-button" aria-label="Go back" title="Go back">
                        <ArrowLeft className="size-4" />
                    </button>

                    <Link href={home()} className="mx-auto flex w-fit items-center justify-center transition-transform hover:scale-[1.02]">
                        <img
                            src="/brand/logo.png"
                            alt={`${name ?? 'BizTrack'} logo`}
                            className="h-auto w-20 rounded-md sm:w-24"
                            onError={(event) => {
                                event.currentTarget.src = '/brand/biztrack-logo.jpg';
                            }}
                        />
                    </Link>

                    <header className="mb-5 mt-3 text-center">
                        <h1 className="text-2xl font-semibold tracking-normal text-[#10231a] sm:text-[26px]">
                            {title}
                        </h1>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#607568]">
                            {description}
                        </p>
                    </header>

                    {children}
                </div>
            </section>
        </main>
    );
}
