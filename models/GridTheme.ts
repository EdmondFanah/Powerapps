export interface GridTheme {
    primaryColor?: string;
    headerBackground?: string;
    headerTextColor?: string;
    rowBackground?: string;
    alternateRowBackground?: string;
    selectedRowBackground?: string;
    hoverRowBackground?: string;
    borderColor?: string;
    fontFamily?: string;
    fontSize?: string;
    rowHeight?: number;
}

export const defaultTheme: GridTheme = {
    primaryColor: '#0078d4',
    headerBackground: '#f3f2f1',
    headerTextColor: '#323130',
    rowBackground: '#ffffff',
    alternateRowBackground: '#faf9f8',
    selectedRowBackground: '#deecf9',
    hoverRowBackground: '#edebe9',
    borderColor: '#e0e0e0',
    fontFamily: 'Segoe UI, sans-serif',
    fontSize: '14px',
    rowHeight: 36,
};

export function getDefaultAlign(dataType?: string): 'left' | 'center' | 'right' {
    if (!dataType) return 'left';
    if (/Whole|Decimal|FP|Currency|Float|Number/i.test(dataType)) return 'right';
    if (/TwoOptions/i.test(dataType)) return 'center';
    return 'left';
}
