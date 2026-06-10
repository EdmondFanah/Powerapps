import * as React from 'react';
import { GridCell } from './GridCell';
import { GridColumn } from '../models/GridColumn';

export interface GridRowProps {
    rowId: string;
    record: Record<string, string>;
    columns: GridColumn[];
    isSelected: boolean;
    isEditable: boolean;
    onSelect: (id: string) => void;
    onCellEdit?: (rowId: string, columnKey: string, value: string) => void;
    showDirtyIndicator: boolean;
    isDirty: boolean;
    rowIndex: number;
    alternateRowColor: boolean;
    primaryColor: string;
    rowHeight: number;
    borderColor: string;
    frozenColumns: number;
    colWidths: Record<string, number>;
}

export const GridRow: React.FC<GridRowProps> = ({
    rowId,
    record,
    columns,
    isSelected,
    isEditable,
    onSelect,
    onCellEdit,
    showDirtyIndicator,
    isDirty,
    rowIndex,
    alternateRowColor,
    primaryColor,
    rowHeight,
    borderColor,
    frozenColumns,
    colWidths,
}) => {
    const [hovered, setHovered] = React.useState(false);

    const getBg = () => {
        if (isSelected) return `${primaryColor}22`; // light tint of primary
        if (hovered) return '#edebe9';
        if (alternateRowColor && rowIndex % 2 === 1) return '#faf9f8';
        return '#ffffff';
    };

    // Calculate sticky left for frozen columns
    const stickyLeft = React.useMemo(() => {
        const pos: Record<string, number> = {};
        let acc = showDirtyIndicator ? 6 : 0;
        columns.forEach((col, i) => {
            if (i < frozenColumns) {
                pos[col.key] = acc;
                acc += colWidths[col.key] ?? 150;
            }
        });
        return pos;
    }, [columns, frozenColumns, colWidths, showDirtyIndicator]);

    const bg = getBg();

    return (
        <tr
            style={{ backgroundColor: bg, cursor: 'default' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onSelect(rowId)}
        >
            {showDirtyIndicator && (
                <td
                    style={{
                        width: 6,
                        padding: 0,
                        backgroundColor: isDirty ? '#ffb900' : bg,
                        borderBottom: `1px solid ${borderColor}`,
                        borderRight: `1px solid ${borderColor}`,
                        verticalAlign: 'middle',
                        position: 'sticky',
                        left: 0,
                        zIndex: 1,
                    }}
                />
            )}
            {columns.map((col, i) => {
                const isFrozen = i < frozenColumns;
                return (
                    <td
                        key={col.key}
                        style={
                            isFrozen
                                ? {
                                    position: 'sticky',
                                    left: stickyLeft[col.key],
                                    zIndex: 1,
                                    backgroundColor: bg,
                                    padding: 0,
                                    borderBottom: `1px solid ${borderColor}`,
                                    borderRight: `1px solid ${borderColor}`,
                                }
                                : { padding: 0, borderBottom: `1px solid ${borderColor}` }
                        }
                    >
                        <GridCell
                            value={record[col.fieldName] ?? ''}
                            isEditable={isEditable}
                            dataType={col.dataType}
                            align={col.align}
                            rowHeight={rowHeight}
                            borderColor={'transparent'}
                            onEdit={val => onCellEdit?.(rowId, col.key, val)}
                        />
                    </td>
                );
            })}
        </tr>
    );
};
