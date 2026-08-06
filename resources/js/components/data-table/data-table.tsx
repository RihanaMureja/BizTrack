import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type DataTableColumn<T> = {
    key: string;
    header: string;
    render?: (row: T) => ReactNode;
    className?: string;
};

type Props<T> = {
    columns: DataTableColumn<T>[];
    data: T[];
    rowKey: (row: T) => string | number;
    emptyMessage?: string;
};

export function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    rowKey,
    emptyMessage = 'No records found.',
}: Props<T>) {
    return (
        <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} className={cn('px-4 py-3 font-medium', column.className)}>
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => (
                            <tr key={rowKey(row)} className="hover:bg-muted/30">
                                {columns.map((column) => (
                                    <td key={column.key} className={cn('px-4 py-3 align-middle', column.className)}>
                                        {column.render ? column.render(row) : String(row[column.key] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
