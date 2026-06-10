import * as React from 'react';
import { DataGrid } from './components/DataGrid';
import { GridColumn } from './models/GridColumn';
import { getDefaultAlign } from './models/GridTheme';
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

function buildColumns(
    dataset: ComponentFramework.PropertyTypes.DataSet,
    configJson: string | null
): GridColumn[] {
    const configMap = parseColumnConfig(configJson);
    return dataset.columns.map(col => {
        const override = configMap[col.name] ?? {};
        return {
            key: col.name,
            name: override.label ?? col.displayName,
            fieldName: col.name,
            width: override.width ?? (col.visualSizeFactor > 0 ? col.visualSizeFactor : 150),
            align: override.align ?? getDefaultAlign(col.dataType),
            visible: override.visible ?? true,
            isResizable: true,
            isSortable: true,
            isFilterable: true,
            dataType: col.dataType,
        };
    });
}

function buildRecords(
    dataset: ComponentFramework.PropertyTypes.DataSet
): { records: Record<string, string>[]; ids: string[] } {
    const ids = dataset.sortedRecordIds;
    const records = ids.map(id => {
        const record = dataset.records[id];
        const row: Record<string, string> = {};
        dataset.columns.forEach(col => {
            row[col.name] = record.getFormattedValue(col.name) ?? '';
        });
        return row;
    });
    return { records, ids };
}

export const App: React.FC<AppProps> = ({ inputs, onSelectionChange, onDirtyCountChange }) => {
    const dataset = inputs.sampleDataSet;
    const columnConfigJson = inputs.ColumnConfig?.raw ?? null;

    const columns = React.useMemo(
        () => buildColumns(dataset, columnConfigJson),
        [dataset, columnConfigJson]
    );
    const { records, ids } = React.useMemo(() => buildRecords(dataset), [dataset]);

    return (
        <DataGrid
            columns={columns}
            records={records}
            recordIds={ids}
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
