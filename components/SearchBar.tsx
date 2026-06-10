import * as React from 'react';

export interface SearchBarProps {
    filterText: string;
    onFilterChange: (text: string) => void;
    placeholder?: string;
    primaryColor?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ filterText, onFilterChange, placeholder, primaryColor }) => {
    const [focused, setFocused] = React.useState(false);
    return (
        <div style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid #e0e0e0', flexShrink: 0, gap: 6 }}>
            <span style={{ color: '#605e5c', fontSize: 14, lineHeight: 1 }}>🔍</span>
            <input
                type="search"
                value={filterText}
                onChange={e => onFilterChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={placeholder ?? 'Search all columns…'}
                style={{
                    flex: 1,
                    maxWidth: 360,
                    padding: '5px 10px',
                    border: `1px solid ${focused ? (primaryColor ?? '#0078d4') : '#8a8886'}`,
                    borderRadius: 2,
                    fontSize: 13,
                    fontFamily: 'Segoe UI, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
                    boxShadow: focused ? `0 0 0 1px ${primaryColor ?? '#0078d4'}` : 'none',
                    transition: 'box-shadow 0.1s',
                }}
            />
            {filterText && (
                <button
                    onClick={() => onFilterChange('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#605e5c', padding: '2px 4px' }}
                    title="Clear search"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

