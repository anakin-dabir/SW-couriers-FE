import * as React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { TableHead } from '@/components/molecules/table';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';
import type { Alignment } from '@/types/datatable';

interface TableHeaderCellProps {
  /** Column header label */
  header: string;
  /** Header alignment */
  align?: Alignment;
  /** Additional className */
  className?: string;
  /** Light grey, normal-weight label (e.g. audit activity tables) */
  muted?: boolean;
  /** Sort indicator (design affordance; does not toggle sort by itself) */
  showSortHint?: boolean;
}

/**
 * Atom component for table header cell
 */
export default function TableHeaderCell({
  header,
  align = 'center',
  className,
  muted = false,
  showSortHint = false,
}: TableHeaderCellProps): React.JSX.Element {
  const ALIGNMENT_CLASSES = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <TableHead
      className={cn(
        'h-auto bg-transparent',
        muted
          ? 'px-2.5 py-1.5 text-[13px] font-normal text-[#71717A]'
          : 'px-2.5 py-1.5 font-semibold text-xs text-form-title',
        ALIGNMENT_CLASSES[align],
        className
      )}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1.5',
          align === 'right' && 'justify-end',
          align === 'center' && 'justify-center'
        )}
      >
        <Typography
          variant="caption"
          weight={muted ? 'normal' : 'semibold'}
          className={cn(
            muted ? 'text-[13px] text-[#71717A]' : 'text-form-title',
            muted && showSortHint && 'font-medium text-[#52525B]'
          )}
        >
          {header}
        </Typography>
        {showSortHint ? (
          <ArrowUpDown
            className="h-3.5 w-3.5 shrink-0 text-[#A1A1AA]"
            strokeWidth={2}
            aria-hidden
          />
        ) : null}
      </span>
    </TableHead>
  );
}
