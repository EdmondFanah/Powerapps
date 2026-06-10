import * as React from 'react';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    primaryColor: string;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    primaryColor,
}) => {
    const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    const btn = (label: string, page: number | null, active = false, disabled = false): React.ReactNode => (
        <button
            key={label}
            onClick={() => page !== null && !disabled && onPageChange(page)}
            disabled={disabled}
            style={{
                padding: '3px 9px',
                border: `1px solid ${active ? primaryColor : '#e0e0e0'}`,
                borderRadius: 2,
                backgroundColor: active ? primaryColor : '#fff',
                color: active ? '#fff' : disabled ? '#c8c6c4' : '#323130',
                cursor: disabled ? 'default' : 'pointer',
                fontSize: 12,
                fontFamily: 'Segoe UI, sans-serif',
                minWidth: 28,
                lineHeight: '18px',
                outline: 'none',
            }}
        >
            {label}
        </button>
    );

    const pages: Array<number | '...'> = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push('...');
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderTop: '1px solid #e0e0e0',
                flexShrink: 0,
                backgroundColor: '#faf9f8',
            }}
        >
            <span style={{ fontSize: 12, color: '#605e5c' }}>
                {totalItems === 0 ? 'No records' : `${start}–${end} of ${totalItems}`}
            </span>
            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                {btn('«', 1, false, currentPage === 1)}
                {btn('‹', currentPage - 1, false, currentPage === 1)}
                {pages.map((p, i) =>
                    p === '...'
                        ? <span key={`e${i}`} style={{ padding: '0 4px', color: '#605e5c', fontSize: 12 }}>…</span>
                        : btn(String(p), p as number, p === currentPage, false)
                )}
                {btn('›', currentPage + 1, false, currentPage === totalPages)}
                {btn('»', totalPages, false, currentPage === totalPages)}
            </div>
        </div>
    );
};
