import * as React from 'react';

export interface ToolbarProps {
    dirtyCount: number;
    showLocalSaveIndicator: boolean;
    primaryColor: string;
    onSave?: () => void;
    onDiscard?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    dirtyCount,
    showLocalSaveIndicator,
    primaryColor,
    onSave,
    onDiscard,
}) => {
    if (!showLocalSaveIndicator) return null;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 8px',
                borderBottom: '1px solid #e0e0e0',
                minHeight: 38,
                flexShrink: 0,
                backgroundColor: '#faf9f8',
            }}
        >
            {dirtyCount > 0 && (
                <span style={{ color: '#605e5c', fontSize: 12 }}>
                    {dirtyCount} unsaved change{dirtyCount !== 1 ? 's' : ''}
                </span>
            )}
            <button
                onClick={onSave}
                disabled={dirtyCount === 0}
                style={{
                    padding: '4px 14px',
                    backgroundColor: dirtyCount > 0 ? primaryColor : '#f3f2f1',
                    color: dirtyCount > 0 ? '#fff' : '#a19f9d',
                    border: 'none',
                    borderRadius: 2,
                    cursor: dirtyCount > 0 ? 'pointer' : 'default',
                    fontSize: 13,
                    fontFamily: 'Segoe UI, sans-serif',
                }}
            >
                Save
            </button>
            <button
                onClick={onDiscard}
                disabled={dirtyCount === 0}
                style={{
                    padding: '4px 14px',
                    background: 'transparent',
                    border: '1px solid #8a8886',
                    borderRadius: 2,
                    cursor: dirtyCount > 0 ? 'pointer' : 'default',
                    fontSize: 13,
                    color: dirtyCount > 0 ? '#323130' : '#a19f9d',
                    fontFamily: 'Segoe UI, sans-serif',
                }}
            >
                Discard
            </button>
        </div>
    );
};
