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
        <main className="auth-neon relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
            <div aria-hidden="true" className="auth-ribbon auth-ribbon-one" />
            <div aria-hidden="true" className="auth-ribbon auth-ribbon-two" />
            <div aria-hidden="true" className="auth-ribbon auth-ribbon-three" />
            <div aria-hidden="true" className="auth-ambient-glow" />

            <section className={`auth-glass-card relative z-10 w-full ${isRegistration ? 'max-w-[600px]' : 'max-w-[560px]'}`}>
                <div className="auth-glass-highlight" aria-hidden="true" />
                <div className={`relative px-6 py-7 sm:px-8 sm:py-8 ${isRegistration ? 'max-h-[calc(100dvh-3rem)] overflow-y-auto' : ''}`}>
                    <button type="button" onClick={goBack} className="auth-back-button" aria-label="Go back" title="Go back">
                        <ArrowLeft className="size-5" />
                    </button>

                    <Link href={home()} className="mx-auto flex w-fit items-center justify-center transition-transform hover:scale-[1.02]">
                        <img
                            src="/brand/logo.png"
                            alt={`${name ?? 'BizTrack'} logo`}
                            className="h-auto w-24 rounded-lg sm:w-28"
                            onError={(event) => {
                                event.currentTarget.src = '/brand/biztrack-logo.jpg';
                            }}
                        />
                    </Link>

                    <header className="mb-6 mt-4 text-center">
                        <h1 className="text-[28px] font-semibold tracking-tight text-white sm:text-[32px]">
                            {title}
                        </h1>
                        <p className="mt-3 text-sm text-emerald-100/70 sm:text-base">
                            {description}
                        </p>
                    </header>

                    {children}
                </div>
            </section>
        </main>
    );
}
