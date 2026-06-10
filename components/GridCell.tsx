import * as React from 'react';

export interface GridCellProps {
    value: string;
    isEditable: boolean;
    dataType?: string;
    align?: 'left' | 'center' | 'right';
    rowHeight: number;
    borderColor: string;
    onEdit?: (value: string) => void;
}

export const GridCell: React.FC<GridCellProps> = ({
    value,
    isEditable,
    dataType,
    align,
    rowHeight,
    borderColor,
    onEdit,
}) => {
    const [editing, setEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState(value);

    React.useEffect(() => { setEditValue(value); }, [value]);

    const isBool = /TwoOptions/i.test(dataType ?? '');
    const isNum  = /Whole|Decimal|FP|Currency|Float|Number/i.test(dataType ?? '');
    const textAlign = align ?? (isNum ? 'right' : 'left');

    const handleDoubleClick = () => { if (isEditable && !isBool) setEditing(true); };

    const commit = () => {
        setEditing(false);
        if (onEdit && editValue !== value) onEdit(editValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') { setEditing(false); setEditValue(value); }
    };

    const handleBoolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.checked ? 'Yes' : 'No';
        onEdit?.(v);
    };

    const cellStyle: React.CSSProperties = {
        padding: '0 10px',
        borderBottom: `1px solid ${borderColor}`,
        borderRight: `1px solid ${borderColor}`,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign,
        height: rowHeight,
        verticalAlign: 'middle',
        fontSize: 'inherit',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    };

    if (isBool) {
        const checked = /^(true|yes|1)$/i.test(value);
        return (
            <td style={cellStyle}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={isEditable ? handleBoolChange : undefined}
                    readOnly={!isEditable}
                    style={{ cursor: isEditable ? 'pointer' : 'default', accentColor: 'inherit' }}
                />
            </td>
        );
    }

    return (
        <td
            style={cellStyle}
            onDoubleClick={handleDoubleClick}
            title={value}
        >
            {editing ? (
                <input
                    autoFocus
                    type={isNum ? 'number' : 'text'}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={commit}
                    onKeyDown={handleKeyDown}
                    style={{
                        width: '100%',
                        border: '1px solid #0078d4',
                        padding: '2px 4px',
                        fontSize: 'inherit',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        outline: 'none',
                    }}
                />
            ) : (
                <span>{value}</span>
            )}
        </td>
    );
};
