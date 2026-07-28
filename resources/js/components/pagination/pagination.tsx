import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    links: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total?: number;
};

export function Pagination({ links, from, to, total }: Props) {
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {typeof total === 'number' && (
                <p className="text-sm text-muted-foreground">
                    Showing {from ?? 0}-{to ?? 0} of {total} results
                </p>
            )}
            <div className="flex flex-wrap items-center gap-1">
                {links.map((link, index) => (
                    <Button
                        key={index}
                        type="button"
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        disabled={!link.url}
                        onClick={() =>
                            link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })
                        }
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </div>
    );
}
