import { useState, useMemo } from 'react';

/**
 * Paginates an array of items.
 * Usage:
 *   const { page, totalPages, currentItems, goTo, next, prev } = usePagination(items, 10);
 */
export function usePagination(items = [], pageSize = 10) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const currentItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const goTo = (n) => setPage(Math.min(Math.max(1, n), totalPages));
  const next  = () => goTo(page + 1);
  const prev  = () => goTo(page - 1);

  // Reset to page 1 when items change (e.g. after filtering)
  // Caller should call goTo(1) after filtering if desired

  return { page, totalPages, currentItems, goTo, next, prev, pageSize };
}

export default usePagination;
