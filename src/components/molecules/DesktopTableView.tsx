import * as React from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableRow as UITableRow,
} from '@/components/molecules/table';
import TableHeaderCell from '@/components/atoms/TableHeaderCell';
import TableRow from './TableRow';
import { cn } from '@/lib/utils';
import type { Column } from '@/types/datatable';

interface DesktopTableViewProps<T> {
  /** Table data */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Row key accessor */
  getRowKey?: (row: T, index: number) => string | number;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T, index: number) => string | undefined;
}

/**
 * Molecule component for desktop table view
 */
export default function DesktopTableView<T = Record<string, unknown>>({
  data,
  columns,
  getRowKey,
  onRowClick,
  getRowClassName,
}: DesktopTableViewProps<T>): React.JSX.Element {
  return (
    <div className="hidden md:block">
      <Table className="w-full border-collapse">
        <TableHeader>
          <UITableRow className="border-0 hover:bg-transparent">
            {columns.map((column) => (
              <TableHeaderCell
                key={String(column.key)}
                header={column.header}
                align={column.headerAlign}
                muted={column.headerMuted}
                showSortHint={column.headerShowSort}
                className={cn(column.className, column.headerClassName)}
              />
            ))}
          </UITableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}
              row={row}
              rowIndex={rowIndex}
              columns={columns}
              onRowClick={onRowClick}
              className={getRowClassName?.(row, rowIndex)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
