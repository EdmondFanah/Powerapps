import * as React from 'react';
import { GridHeader } from './GridHeader';
import { GridRow } from './GridRow';
import { SearchBar } from './SearchBar';
import { Toolbar } from './Toolbar';
import { Pagination } from './Pagination';
import { GridColumn } from '../models/GridColumn';
import { useFiltering } from '../hooks/useFiltering';
import { useSorting } from '../hooks/useSorting';
import { useSelection } from '../hooks/useSelection';
import { usePagination } from '../hooks/usePagination';
import { useColumnResize } from '../hooks/useColumnResize';

export interface DataGridProps {
    columns: GridColumn[];
    records: Record<string, string>[];
    recordIds: string[];
    headerHeight: number;
    wrapHeaderText: boolean;
    headerHorizontalAlign: string;
    headerVerticalAlign: string;
    enableRowSelection: boolean;
    enableInlineEdit: boolean;
    showLocalSaveIndicator: boolean;
    pageSize: number;
    showPagination: boolean;
    showSearch: boolean;
    alternateRowColor: boolean;
    primaryColor: string;
    fontSize: number;
    rowHeight: number;
    showGridLines: boolean;
    frozenColumns: number;
    onSelectionChange?: (id: string | null) => void;
    onDirtyCountChange?: (count: number) => void;
}

type RowRecord = Record<string, unknown> & { __id: string };

export const DataGrid: React.FC<DataGridProps> = props => {
    const {
        columns,
        records,
        recordIds,
        headerHeight,
        wrapHeaderText,
        headerHorizontalAlign,
        headerVerticalAlign,
        enableRowSelection,
        enableInlineEdit,
        showLocalSaveIndicator,
        pageSize,
        showPagination,
        showSearch,
        alternateRowColor,
        primaryColor,
        fontSize,
        rowHeight,
        showGridLines,
        frozenColumns,
        onSelectionChange,
        onDirtyCountChange,
    } = props;

    const rowsWithId = React.useMemo<RowRecord[]>(
        () => records.map((r, i) => ({ ...r, __id: recordIds[i] ?? String(i) })),
        [records, recordIds]
    );

    const { filteredItems, filterText, onFilterChange } = useFiltering(rowsWithId);
    const { sortedItems, sortColumns, onSort } = useSorting(filteredItems);
    const { selectedId, onSelect } = useSelection(enableRowSelection);

    const effectivePageSize = showPagination ? (pageSize > 0 ? pageSize : 50) : sortedItems.length || 1;
    const { pageItems, currentPage, totalPages, setCurrentPage, totalItems } =
        usePagination(sortedItems, effectivePageSize);

    // Column widths — initialized from columns prop
    const [colWidths, setColWidths] = React.useState<Record<string, number>>(() => {
        const w: Record<string, number> = {};
        columns.forEach(c => { w[c.key] = c.width ?? 150; });
        return w;
    });

    React.useEffect(() => {
        setColWidths(prev => {
            const next = { ...prev };
            columns.forEach(c => { if (!(c.key in next)) next[c.key] = c.width ?? 150; });
            return next;
        });
    }, [columns]);

    const { onResizeStart } = useColumnResize(setColWidths);

    const [dirtyRows, setDirtyRows] = React.useState<Record<string, Record<string, string>>>({});

    const handleCellEdit = (rowId: string, columnKey: string, value: string) => {
        setDirtyRows(prev => ({
            ...prev,
            [rowId]: { ...(prev[rowId] ?? {}), [columnKey]: value },
        }));
    };

    const dirtyCount = Object.keys(dirtyRows).length;

    React.useEffect(() => { onSelectionChange?.(selectedId); }, [selectedId]);
    React.useEffect(() => { onDirtyCountChange?.(dirtyCount); }, [dirtyCount]);

    const handleFilterChange = (text: string) => {
        onFilterChange(text);
        setCurrentPage(1);
    };

    const visibleColumns = columns.filter(c => c.visible !== false);
    const borderColor = showGridLines ? '#e0e0e0' : 'transparent';

    return (
        <div
            style={{
                fontFamily: 'Segoe UI, sans-serif',
                fontSize: fontSize > 0 ? fontSize : 14,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                boxSizing: 'border-box',
            }}
        >
            <Toolbar
                dirtyCount={dirtyCount}
                showLocalSaveIndicator={showLocalSaveIndicator}
                primaryColor={primaryColor}
                onSave={() => setDirtyRows({})}
                onDiscard={() => setDirtyRows({})}
            />
            {showSearch && (
                <SearchBar
                    filterText={filterText}
                    onFilterChange={handleFilterChange}
                    primaryColor={primaryColor}
                />
            )}
            {/* Stats bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '2px 10px', fontSize: 11, color: '#a19f9d', flexShrink: 0, borderBottom: `1px solid #f3f2f1` }}>
                {filteredItems.length !== rowsWithId.length
                    ? `${filteredItems.length} of ${rowsWithId.length} rows`
                    : `${rowsWithId.length} rows`}
                {sortColumns.length > 0 && (
                    <span style={{ marginLeft: 10 }}>
                        Sorted by: {sortColumns.map(sc => `${sc.column} ${sc.direction === 'asc' ? '↑' : '↓'}`).join(', ')}
                        <button
                            onClick={() => onSort('', false)}
                            style={{ marginLeft: 4, fontSize: 10, background: 'none', border: 'none', cursor: 'pointer', color: primaryColor }}
                            title="Clear sort"
                        >
                            ✕
                        </button>
                    </span>
                )}
            </div>

            {/* Table scroll container */}
            <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                <table
                    style={{
                        borderCollapse: 'collapse',
                        tableLayout: 'fixed',
                        width: visibleColumns.reduce((s, c) => s + (colWidths[c.key] ?? 150), showLocalSaveIndicator ? 6 : 0),
                        minWidth: '100%',
                    }}
                >
                    <colgroup>
                        {showLocalSaveIndicator && <col style={{ width: 6 }} />}
                        {visibleColumns.map(col => (
                            <col key={col.key} style={{ width: colWidths[col.key] ?? 150 }} />
                        ))}
                    </colgroup>
                    <GridHeader
                        columns={visibleColumns}
                        colWidths={colWidths}
                        height={headerHeight}
                        wrapText={wrapHeaderText}
                        horizontalAlign={headerHorizontalAlign}
                        verticalAlign={headerVerticalAlign}
                        sortColumns={sortColumns}
                        onSort={onSort}
                        showDirtyIndicatorColumn={showLocalSaveIndicator}
                        onResizeStart={onResizeStart}
                        primaryColor={primaryColor}
                        borderColor={borderColor}
                        frozenColumns={frozenColumns}
                    />
                    <tbody>
                        {pageItems.map((row, idx) => (
                            <GridRow
                                key={row.__id}
                                rowId={row.__id}
                                record={row as Record<string, string>}
                                columns={visibleColumns}
                                isSelected={selectedId === row.__id}
                                isEditable={enableInlineEdit}
                                onSelect={onSelect}
                                onCellEdit={handleCellEdit}
                                showDirtyIndicator={showLocalSaveIndicator}
                                isDirty={!!dirtyRows[row.__id]}
                                rowIndex={idx}
                                alternateRowColor={alternateRowColor}
                                primaryColor={primaryColor}
                                rowHeight={rowHeight > 0 ? rowHeight : 36}
                                borderColor={borderColor}
                                frozenColumns={frozenColumns}
                                colWidths={colWidths}
                            />
                        ))}
                    </tbody>
                </table>
                {pageItems.length === 0 && (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: 40,
                            color: '#a19f9d',
                            fontSize: 14,
                        }}
                    >
                        {filterText ? 'No records match your search.' : 'No data available.'}
                    </div>
                )}
            </div>

            {showPagination && totalItems > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={effectivePageSize}
                    onPageChange={setCurrentPage}
                    primaryColor={primaryColor}
                />
            )}
        </div>
    );
};
