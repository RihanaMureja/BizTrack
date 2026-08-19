import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface TabsProps {
    value: string;
    onValueChange: (value: string) => void;
    children: ReactNode;
    className?: string;
}

function Tabs({ value, onValueChange, children, className }: TabsProps) {
    return (
        <div className={cn('w-full', className)} data-value={value}>
            {children}
        </div>
    );
}

interface TabsListProps {
    children: ReactNode;
    className?: string;
}

function TabsList({ children, className }: TabsListProps) {
    return <div className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}>{children}</div>;
}

interface TabsTriggerProps {
    value: string;
    children: ReactNode;
    className?: string;
}

function TabsTrigger({ value, children, className }: TabsTriggerProps) {
    return (
        <button
            type="button"
            value={value}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
                className,
            )}
        >
            {children}
        </button>
    );
}

interface TabsContentProps {
    value: string;
    children: ReactNode;
    className?: string;
}

function TabsContent({ value, children, className }: TabsContentProps) {
    return <div className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)}>{children}</div>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
