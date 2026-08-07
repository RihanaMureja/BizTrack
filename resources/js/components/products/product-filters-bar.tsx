import { SearchBox } from '@/components/search-box/search-box';

type Category = {
    id: number;
    name: string;
};

type Filters = {
    search: string | null;
    category_id: number | null;
    status: string | null;
    sort: string | null;
};

type Props = {
    categories: Category[];
    filters: Filters;
    statuses: Array<{ value: string; label: string }>;
    onChange: (filters: Partial<Filters>) => void;
};

export function ProductFiltersBar({ categories, filters, statuses, onChange }: Props) {
    return (
        <div className="grid gap-3 rounded-md border bg-card p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_12rem_12rem_12rem]">
            <SearchBox
                defaultValue={filters.search ?? ''}
                placeholder="Search products or barcodes..."
                onSearch={(search) => onChange({ search: search || null })}
            />
            <select
                value={filters.category_id ?? ''}
                onChange={(event) => onChange({ category_id: event.target.value ? Number(event.target.value) : null })}
                className="border-input bg-background flex h-10 rounded-md border px-3 text-sm shadow-xs"
            >
                <option value="">All categories</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                ))}
            </select>
            <select
                value={filters.status ?? ''}
                onChange={(event) => onChange({ status: event.target.value || null })}
                className="border-input bg-background flex h-10 rounded-md border px-3 text-sm shadow-xs"
            >
                <option value="">All statuses</option>
                {statuses.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                ))}
            </select>
            <select
                value={filters.sort ?? ''}
                onChange={(event) => onChange({ sort: event.target.value || null })}
                className="border-input bg-background flex h-10 rounded-md border px-3 text-sm shadow-xs"
            >
                <option value="">Newest first</option>
                <option value="name">Name A-Z</option>
                <option value="price_high">Price high</option>
                <option value="price_low">Price low</option>
                <option value="stock_low">Low stock</option>
            </select>
        </div>
    );
}
