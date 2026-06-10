import { useCallback } from 'react';
import * as React from 'react';

export function useColumnResize(
    setWidths: React.Dispatch<React.SetStateAction<Record<string, number>>>
) {
    const onResizeStart = useCallback(
        (key: string, startX: number, startWidth: number) => {
            const onMouseMove = (e: MouseEvent) => {
                const diff = e.clientX - startX;
                const newWidth = Math.max(40, startWidth + diff);
                setWidths(prev => ({ ...prev, [key]: newWidth }));
            };
            const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        },
        [setWidths]
    );

    return { onResizeStart };
}
