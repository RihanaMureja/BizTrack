import { useState, useMemo } from 'react';

/**
 * Sorts an array by a column key, toggling asc/desc on repeated clicks.
 * Usage:
 *   const { sorted, sortKey, sortDir, requestSort } = useSort(items, 'date', 'desc');
 */
export function useSort(items = [], defaultKey = '', defaultDir = 'asc') {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDir, setSortDir] = useState(defaultDir); // 'asc' | 'desc'

  const requestSort = (key) => {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return items;
    return [...items].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      const cmp = av < bv ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir]);

  return { sorted, sortKey, sortDir, requestSort };
}

export default useSort;
