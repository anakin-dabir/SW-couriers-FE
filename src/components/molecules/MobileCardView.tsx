import * as React from 'react';
import MobileCard from '@/components/atoms/MobileCard';
import MobileCardField from '@/components/atoms/MobileCardField';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';
import type { Column } from '@/types/datatable';

interface MobileCardViewProps<T> {
  /** Table data */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Row key accessor */
  getRowKey?: (row: T, index: number) => string | number;
  /** Card click handler */
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T, index: number) => string | undefined;
}

/**
 * Molecule component for mobile card view
 */
export default function MobileCardView<T = Record<string, unknown>>({
  data,
  columns,
  getRowKey,
  onRowClick,
  getRowClassName,
}: MobileCardViewProps<T>): React.JSX.Element {
  // Sort columns by mobileOrder for card view
  const mobileColumns = [...columns].sort((a, b) => {
    const orderA = a.mobileOrder ?? 999;
    const orderB = b.mobileOrder ?? 999;
    return orderA - orderB;
  });

  return (
    <div className="flex flex-col gap-3 md:hidden">
      {data.map((row, rowIndex) => (
        <MobileCard
          key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}
          onClick={() => onRowClick?.(row)}
          className={cn(getRowClassName?.(row, rowIndex))}
        >
          {mobileColumns
            .filter((column) => !column.hideOnMobile)
            .map((column) => {
              // Actions column gets special treatment - render at the end
              if (column.key === 'actions') {
                return (
                  <div
                    key={String(column.key)}
                    className="flex justify-end pt-2 border-t border-gray-100"
                  >
                    {column.cell ? column.cell(row, rowIndex) : null}
                  </div>
                );
              }

              return (
                <MobileCardField key={String(column.key)} label={column.header}>
                  {column.cell ? (
                    column.cell(row, rowIndex)
                  ) : (
                    <Typography variant="caption" weight="medium" className="text-form-title">
                      {String(row[column.key as keyof T] ?? '')}
                    </Typography>
                  )}
                </MobileCardField>
              );
            })}
        </MobileCard>
      ))}
    </div>
  );
}
