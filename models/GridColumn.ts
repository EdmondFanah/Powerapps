export interface GridColumn {
    key: string;
    name: string;
    fieldName: string;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    isResizable?: boolean;
    isSortable?: boolean;
    isFilterable?: boolean;
    dataType?: string;
    align?: 'left' | 'center' | 'right';
    visible?: boolean;
}
