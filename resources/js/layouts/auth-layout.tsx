import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import type { AuthLayoutProps } from '@/types';

export default function AuthLayout({
    title = '',
    description = '',
    backHref,
    children,
}: AuthLayoutProps) {
    return (
        <AuthLayoutTemplate
            title={title}
            description={description}
            backHref={backHref}
        >
            {children}
        </AuthLayoutTemplate>
    );
}
