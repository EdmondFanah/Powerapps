import { useState, useCallback } from 'react';

export function useFiltering<T extends Record<string, unknown>>(items: T[]) {
    const [filterText, setFilterText] = useState<string>('');

    const filteredItems = filterText
        ? items.filter(item =>
              Object.values(item).some(val =>
                  String(val).toLowerCase().includes(filterText.toLowerCase())
              )
          )
        : items;

    const onFilterChange = useCallback((text: string) => {
        setFilterText(text);
    }, []);

    return { filteredItems, filterText, onFilterChange };
}
