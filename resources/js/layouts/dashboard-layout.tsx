import type { ReactNode } from 'react';

type Props = {
    title: string;
    description: string;
    children: ReactNode;
};

export default function DashboardLayout({ title, description, children }: Props) {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
            <div>
                <h1 className="text-xl font-semibold tracking-normal">{title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
        </div>
    );
}
