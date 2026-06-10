import { useState, useCallback } from 'react';

export interface SortColumn {
    column: string;
    direction: 'asc' | 'desc';
}

export function useSorting<T extends Record<string, unknown>>(items: T[]) {
    const [sortColumns, setSortColumns] = useState<SortColumn[]>([]);

    const sortedItems = [...items].sort((a, b) => {
        for (const sc of sortColumns) {
            const aVal = String(a[sc.column] ?? '');
            const bVal = String(b[sc.column] ?? '');
            const cmp = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
            if (cmp !== 0) return sc.direction === 'asc' ? cmp : -cmp;
        }
        return 0;
    });

    const onSort = useCallback((column: string, multiSort?: boolean) => {
        setSortColumns(prev => {
            const existing = prev.find(sc => sc.column === column);
            if (multiSort) {
                if (!existing) return [...prev, { column, direction: 'asc' }];
                if (existing.direction === 'asc')
                    return prev.map(sc => sc.column === column ? { ...sc, direction: 'desc' as const } : sc);
                return prev.filter(sc => sc.column !== column);
            } else {
                if (!existing) return [{ column, direction: 'asc' }];
                if (existing.direction === 'asc') return [{ column, direction: 'desc' }];
                return [];
            }
        });
    }, []);

    return { sortedItems, sortColumns, onSort };
}
