import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
    title: string;
    description?: string;
    icon?: LucideIcon;
    actions?: ReactNode;
};

export function PageHeader({ title, description, icon: Icon, actions }: Props) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                        <Icon className="size-5" />
                    </div>
                )}
                <div>
                    <h1 className="text-xl font-semibold">{title}</h1>
                    {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
                </div>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

export { Button as PageHeaderButton };
