import * as React from 'react';
import { TableCell as UITableCell } from '@/components/molecules/table';
import { cn } from '@/lib/utils';
import type { Alignment } from '@/types/datatable';

interface TableCellProps {
  /** Cell content */
  children: React.ReactNode;
  /** Cell alignment */
  align?: Alignment;
  /** Whether this is the first column */
  isFirst?: boolean;
  /** Whether this is the last column */
  isLast?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Atom component for table cell
 */
export default function TableCell({
  children,
  align = 'center',
  isFirst = false,
  isLast = false,
  className,
}: TableCellProps): React.JSX.Element {
  const ALIGNMENT_CLASSES = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <UITableCell
      className={cn(
        'h-14 px-2.5 py-3 bg-white',
        isFirst && 'rounded-l-2xl',
        isLast && 'rounded-r-2xl',
        ALIGNMENT_CLASSES[align],
        className
      )}
    >
      {children}
    </UITableCell>
  );
}
