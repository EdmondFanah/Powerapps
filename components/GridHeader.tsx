import * as React from 'react';
import { GridColumn } from '../models/GridColumn';
import { SortColumn } from '../hooks/useSorting';

export interface GridHeaderProps {
    columns: GridColumn[];
    colWidths: Record<string, number>;
    height: number;
    wrapText: boolean;
    horizontalAlign: string;
    verticalAlign: string;
    sortColumns: SortColumn[];
    onSort: (column: string, multiSort?: boolean) => void;
    showDirtyIndicatorColumn: boolean;
    onResizeStart: (key: string, startX: number, startWidth: number) => void;
    primaryColor: string;
    borderColor: string;
    frozenColumns: number;
}

export const GridHeader: React.FC<GridHeaderProps> = ({
    columns,
    colWidths,
    height,
    wrapText,
    horizontalAlign,
    verticalAlign,
    sortColumns,
    onSort,
    showDirtyIndicatorColumn,
    onResizeStart,
    primaryColor,
    borderColor,
    frozenColumns,
}) => {
    // Calculate sticky left offsets for frozen columns
    const stickyLeft = React.useMemo(() => {
        const pos: Record<string, number> = {};
        let acc = showDirtyIndicatorColumn ? 6 : 0;
        columns.forEach((col, i) => {
            if (i < frozenColumns) {
                pos[col.key] = acc;
                acc += colWidths[col.key] ?? 150;
            }
        });
        return pos;
    }, [columns, frozenColumns, colWidths, showDirtyIndicatorColumn]);

    const getSortInfo = (colKey: string) => {
        const idx = sortColumns.findIndex(sc => sc.column === colKey);
        if (idx === -1) return null;
        return { direction: sortColumns[idx].direction, rank: idx + 1 };
    };

    const handleClick = (colKey: string, e: React.MouseEvent) => {
        onSort(colKey, e.shiftKey);
    };

    return (
        <thead>
            <tr>
                {showDirtyIndicatorColumn && (
                    <th
                        style={{
                            width: 6,
                            padding: 0,
                            backgroundColor: '#f3f2f1',
                            borderBottom: `2px solid ${primaryColor}`,
                            borderRight: `1px solid ${borderColor}`,
                            position: 'sticky',
                            top: 0,
                            zIndex: 3,
                        }}
                    />
                )}
                {columns.map((col, i) => {
                    const sortInfo = getSortInfo(col.key);
                    const isFrozen = i < frozenColumns;
                    const align = col.align ?? (horizontalAlign as React.CSSProperties['textAlign']) ?? 'left';

                    return (
                        <th
                            key={col.key}
                            style={{
                                padding: '0 10px',
                                textAlign: align,
                                verticalAlign: (verticalAlign as React.CSSProperties['verticalAlign']) || 'middle',
                                whiteSpace: wrapText ? 'normal' : 'nowrap',
                                borderBottom: `2px solid ${primaryColor}`,
                                borderRight: `1px solid ${borderColor}`,
                                backgroundColor: '#f3f2f1',
                                fontWeight: 600,
                                cursor: col.isSortable !== false ? 'pointer' : 'default',
                                userSelect: 'none',
                                height: height || 42,
                                position: 'sticky',
                                top: 0,
                                left: isFrozen ? stickyLeft[col.key] : undefined,
                                zIndex: isFrozen ? 3 : 2,
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                                color: sortInfo ? primaryColor : '#323130',
                            }}
                            onClick={col.isSortable !== false ? e => handleClick(col.key, e) : undefined}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start', gap: 4, paddingRight: 6 }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{col.name}</span>
                                {sortInfo && (
                                    <span style={{ fontSize: 10, flexShrink: 0, color: primaryColor }}>
                                        {sortInfo.direction === 'asc' ? '▲' : '▼'}
                                        {sortColumns.length > 1 && <sup style={{ fontSize: 9 }}>{sortInfo.rank}</sup>}
                                    </span>
                                )}
                                {!sortInfo && col.isSortable !== false && (
                                    <span style={{ fontSize: 10, flexShrink: 0, color: '#c8c6c4' }}>⇅</span>
                                )}
                            </div>
                            {/* Resize handle */}
                            {col.isResizable !== false && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: 5,
                                        cursor: 'col-resize',
                                        zIndex: 1,
                                    }}
                                    onMouseDown={e => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onResizeStart(col.key, e.clientX, colWidths[col.key] ?? 150);
                                    }}
                                />
                            )}
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
};
