import { useState, useCallback } from 'react';

export function useSelection(enableRowSelection: boolean) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const onSelect = useCallback(
        (id: string) => {
            if (!enableRowSelection) return;
            setSelectedId(prev => (prev === id ? null : id));
        },
        [enableRowSelection]
    );

    return { selectedId, onSelect };
}
