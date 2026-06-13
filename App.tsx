import * as React from 'react';
import { DataGrid } from './components/DataGrid';
import { GridColumn } from './models/GridColumn';
import { IInputs } from './ManifestTypes';

export interface AppProps {
    inputs: IInputs;
    onSelectionChange: (id: string | null) => void;
    onDirtyCountChange: (count: number) => void;
}

interface ColConfigEntry {
    name: string;
    label?: string;
    width?: number;
    align?: 'left' | 'center' | 'right';
    visible?: boolean;
}

function parseColumnConfig(json: string | null): Record<string, ColConfigEntry> {
    if (!json) return {};
    try {
        const arr: ColConfigEntry[] = JSON.parse(json);
        const map: Record<string, ColConfigEntry> = {};
        arr.forEach(c => { map[c.name] = c; });
        return map;
    } catch {
        return {};
    }
}

function parseDataJson(json: string | null): Record<string, string>[] {
    if (!json) return [];
    try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) return parsed as Record<string, string>[];
        return [];
    } catch {
        return [];
    }
}

function buildColumnsFromRecords(
    records: Record<string, string>[],
    configJson: string | null
): GridColumn[] {
    if (records.length === 0) return [];
    const configMap = parseColumnConfig(configJson);
    const keys = Object.keys(records[0]).filter(k => k !== '__id');
    return keys.map(key => {
        const override = configMap[key] ?? {};
        return {
            key,
            name: override.label ?? key,
            fieldName: key,
            width: override.width ?? 150,
            align: override.align ?? 'left',
            visible: override.visible ?? true,
            isResizable: true,
            isSortable: true,
            isFilterable: true,
            dataType: 'SingleLine.Text',
        };
    });
}

export const App: React.FC<AppProps> = ({ inputs, onSelectionChange, onDirtyCountChange }) => {
    const dataJson = inputs.DataJson?.raw ?? null;
    const columnConfigJson = inputs.ColumnConfig?.raw ?? null;

    const records = React.useMemo(() => parseDataJson(dataJson), [dataJson]);
    const recordIds = React.useMemo(
        () => records.map((_, i) => String(i)),
        [records]
    );
    const columns = React.useMemo(
        () => buildColumnsFromRecords(records, columnConfigJson),
        [records, columnConfigJson]
    );

    return (
        <DataGrid
            columns={columns}
            records={records}
            recordIds={recordIds}
            headerHeight={inputs.HeaderHeight?.raw ?? 42}
            wrapHeaderText={inputs.WrapHeaderText?.raw ?? false}
            headerHorizontalAlign={inputs.HeaderHorizontalAlign?.raw ?? 'left'}
            headerVerticalAlign={inputs.HeaderVerticalAlign?.raw ?? 'middle'}
            enableRowSelection={inputs.EnableRowSelection?.raw ?? false}
            enableInlineEdit={inputs.EnableInlineEdit?.raw ?? false}
            showLocalSaveIndicator={inputs.ShowLocalSaveIndicator?.raw ?? false}
            pageSize={inputs.PageSize?.raw ?? 50}
            showPagination={inputs.ShowPagination?.raw ?? true}
            showSearch={inputs.ShowSearch?.raw ?? true}
            alternateRowColor={inputs.AlternateRowColor?.raw ?? true}
            primaryColor={inputs.PrimaryColor?.raw || '#0078d4'}
            fontSize={inputs.FontSize?.raw ?? 14}
            rowHeight={inputs.RowHeight?.raw ?? 36}
            showGridLines={inputs.ShowGridLines?.raw ?? true}
            frozenColumns={inputs.FrozenColumns?.raw ?? 0}
            onSelectionChange={onSelectionChange}
            onDirtyCountChange={onDirtyCountChange}
        />
    );
};
