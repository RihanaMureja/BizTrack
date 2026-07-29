import type { ReactNode } from 'react';

type Props = {
    title: string;
    description: string;
    children: ReactNode;
};

export default function DashboardLayout({ title, description, children }: Props) {
    return (
        <div className="flex h-full flex-1 flex-col gap-8 p-4 lg:p-8">
            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-sm md:p-8">
                <div className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-8 -left-8 size-32 rounded-full bg-primary/5 blur-2xl" />
                <div className="relative">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}
