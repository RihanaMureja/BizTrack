import type { ReactNode } from 'react';

type Props = {
    title: string;
    description?: string;
    children: ReactNode;
    actions?: ReactNode;
};

export function FormSection({ title, description, children, actions }: Props) {
    return (
        <section className="rounded-md border bg-card p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="font-semibold">{title}</h2>
                    {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
                </div>
                {actions}
            </div>
            <div className="grid gap-4">{children}</div>
        </section>
    );
}
