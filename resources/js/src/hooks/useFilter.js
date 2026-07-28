import { useState, useMemo } from 'react';

/**
 * Filters an array using a set of filter values.
 * Usage:
 *   const { filtered, filters, setFilter, clearFilters } = useFilter(items, {
 *     status: (item, val) => !val || item.status === val,
 *     search: (item, val) => !val || item.name.toLowerCase().includes(val.toLowerCase()),
 *   });
 */
export function useFilter(items = [], filterDefs = {}) {
  const [filters, setFilters] = useState(
    Object.fromEntries(Object.keys(filterDefs).map(k => [k, '']))
  );

  const setFilter = (key, value) => setFilters(f => ({ ...f, [key]: value }));
  const clearFilters = () => setFilters(Object.fromEntries(Object.keys(filterDefs).map(k => [k, ''])));

  const filtered = useMemo(() => {
    return items.filter(item =>
      Object.entries(filterDefs).every(([key, fn]) => fn(item, filters[key]))
    );
  }, [items, filters]);

  return { filtered, filters, setFilter, clearFilters };
}

export default useFilter;
