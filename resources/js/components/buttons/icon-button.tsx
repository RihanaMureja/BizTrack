import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof Button>, 'children'> & {
    icon: LucideIcon;
    label: string;
};

export function IconButton({ icon: Icon, label, variant = 'ghost', size = 'icon', ...props }: Props) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button type="button" variant={variant} size={size} aria-label={label} {...props}>
                    <Icon className="size-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}
