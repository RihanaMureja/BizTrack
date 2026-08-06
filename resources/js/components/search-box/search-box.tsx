import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

type Props = {
    defaultValue?: string;
    placeholder?: string;
    onSearch: (value: string) => void;
    debounceMs?: number;
    className?: string;
};

export function SearchBox({
    defaultValue = '',
    placeholder = 'Search...',
    onSearch,
    debounceMs = 350,
    className,
}: Props) {
    const [value, setValue] = useState(defaultValue);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => onSearch(value), debounceMs);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
        <div className={className ?? 'relative w-full max-w-xs'}>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={placeholder}
                className="pl-9"
            />
        </div>
    );
}
