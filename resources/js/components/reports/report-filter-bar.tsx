import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

type Category = { id: number; name: string };
type Filters = { type?: string; date_from: string; date_to: string; category_id?: number | string | null; source?: string };

export function ReportFilterBar({ filters, categories = [], action = '/reports' }: { filters: Filters; categories?: Category[]; action?: string }) {
    const apply = (next: Partial<Filters>) => router.get(action, { ...filters, ...next }, { preserveState: true, preserveScroll: true, replace: true });

    return (
        <div className="grid gap-3 rounded-md border bg-card p-4 shadow-sm md:grid-cols-[10rem_10rem_12rem_auto]">
            <input type="date" value={filters.date_from} onChange={(event) => apply({ date_from: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm" />
            <input type="date" value={filters.date_to} onChange={(event) => apply({ date_to: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm" />
            {categories.length > 0 && (
                <select value={filters.category_id ?? ''} onChange={(event) => apply({ category_id: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                    <option value="">All categories</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
            )}
            <Button type="button" variant="outline" onClick={() => apply({})}>Refresh</Button>
        </div>
    );
}
