import * as React from 'react';
import { TableRow as UITableRow } from '@/components/molecules/table';
import TableCell from '@/components/atoms/TableCell';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';
import type { Column } from '@/types/datatable';

interface TableRowProps<T> {
  /** Table row data */
  row: T;
  /** Row index */
  rowIndex: number;
  /** Column definitions */
  columns: Column<T>[];
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Additional className */
  className?: string;
}

/**
 * Molecule component for table row
 */
export default function TableRow<T = Record<string, unknown>>({
  row,
  rowIndex,
  columns,
  onRowClick,
  className,
}: TableRowProps<T>): React.JSX.Element {
  const isClickable = Boolean(onRowClick);

  return (
    <UITableRow
      className={cn(
        'border-b border-border/60 bg-white hover:bg-white',
        isClickable && 'cursor-pointer',
        className
      )}
      onClick={() => onRowClick?.(row)}
    >
      {columns.map((column, colIndex) => {
        const isFirst = colIndex === 0;
        const isLast = colIndex === columns.length - 1;

        return (
          <TableCell
            key={String(column.key)}
            align={column.cellAlign}
            isFirst={isFirst}
            isLast={isLast}
            className={column.className}
          >
            {column.cell ? (
              column.cell(row, rowIndex)
            ) : (
              <Typography variant="caption" weight="medium" className="text-form-title">
                {String(row[column.key as keyof T] ?? '')}
              </Typography>
            )}
          </TableCell>
        );
      })}
    </UITableRow>
  );
}
