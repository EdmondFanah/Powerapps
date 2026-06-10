import { useState, useMemo, useEffect } from 'react';

export function usePagination<T>(items: T[], pageSize: number) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);

    // Reset to page 1 when items or pageSize change
    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize]);

    const pageItems = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [items, safePage, pageSize]);

    return {
        pageItems,
        currentPage: safePage,
        totalPages,
        setCurrentPage,
        totalItems: items.length,
    };
}
