import * as React from 'react';
import { Badge } from '@/components/atoms/badge';
import {
  SEVERITY_BADGE_CLASS_EXTENDED,
  USER_TYPE_BADGE_CLASS_EXTENDED,
  type CreditActivityTableRow,
} from '@/lib/creditPresentation';
import { cn } from '@/lib/utils';

interface CreditActivityTableProps {
  rows: CreditActivityTableRow[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: CreditActivityTableRow) => void;
  className?: string;
  /** Full-log page uses "Status"; dashboard preview may hide status */
  showStatusColumn?: boolean;
  /** Tighter gutters when embedded in dashboard card */
  compact?: boolean;
  /** Match credit overview history tables (Applications / Limit / Activity) */
  variant?: 'default' | 'history';
  /** Column header when status/severity column is shown */
  statusColumnLabel?: string;
}

const TABLE_MIN_WIDTH_PX = 960;

const HEAD_CELL_CLASS = 'h-11 px-4 text-left text-sm font-medium text-[#71717A] whitespace-nowrap';

const HISTORY_HEAD_CELL_CLASS =
  'px-4 py-2.5 text-left text-xs font-medium text-[#71717A] whitespace-nowrap';

const BODY_CELL_CLASS = 'px-4 py-4 text-sm align-middle';

const HISTORY_BODY_CELL_CLASS = 'px-4 py-3 text-sm align-middle';

export function CreditActivityTable({
  rows,
  isLoading = false,
  emptyMessage = 'No credit activity to show.',
  onRowClick,
  className,
  showStatusColumn = true,
  compact = false,
  variant = 'default',
  statusColumnLabel = 'Status',
}: CreditActivityTableProps): React.JSX.Element {
  const colSpan = showStatusColumn ? 5 : 4;
  const isHistory = variant === 'history';
  const sideInset = isHistory ? '' : compact ? 'px-4' : 'px-5';
  const headCell = isHistory ? HISTORY_HEAD_CELL_CLASS : HEAD_CELL_CLASS;
  const bodyCell = isHistory ? HISTORY_BODY_CELL_CLASS : BODY_CELL_CLASS;
  const headerRowClass = isHistory
    ? 'border-b border-[#F1F1F4] bg-white'
    : 'border-b border-[#E5E7EB] bg-[#F9FAFB]';
  const bodyRowClass = isHistory ? 'border-b border-[#F5F5F6]' : 'border-b border-[#F1F5F9]';
  const emptyCellClass = isHistory
    ? 'px-4 py-10 text-center text-sm text-[#71717A]'
    : 'py-12 text-center text-sm text-[#71717A]';

  return (
    <div className={cn(sideInset, className)}>
      <div
        className={cn(
          'overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]',
          isHistory ? 'w-full' : 'rounded-sm'
        )}
        role="region"
        aria-label="Credit activity table"
        tabIndex={0}
      >
        <table className="w-full caption-bottom text-sm" style={{ minWidth: TABLE_MIN_WIDTH_PX }}>
          <thead className="[&_tr]:border-b">
            <tr className={headerRowClass}>
              <th className={cn(headCell, 'min-w-[200px]')}>Event Type</th>
              <th className={cn(headCell, 'min-w-[280px]')}>Description</th>
              <th className={cn(headCell, 'min-w-[110px]')}>User Type</th>
              <th className={cn(headCell, 'min-w-[168px]')}>Timestamp</th>
              {showStatusColumn ? (
                <th className={cn(headCell, 'min-w-[96px]')}>{statusColumnLabel}</th>
              ) : null}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className={emptyCellClass}>
                  Loading activity…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className={emptyCellClass}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    bodyRowClass,
                    'transition-colors last:border-0',
                    onRowClick && 'cursor-pointer hover:bg-[#FAFAFA]'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  <td
                    className={cn(
                      bodyCell,
                      isHistory ? 'font-medium text-[#18181B]' : 'font-medium text-[#18181B]'
                    )}
                  >
                    {row.eventType}
                  </td>
                  <td className={cn(bodyCell, 'max-w-[420px]')}>
                    <span
                      className="line-clamp-2 break-words text-[#52525B]"
                      title={row.description !== '—' ? row.description : undefined}
                    >
                      {row.description}
                    </span>
                  </td>
                  <td className={bodyCell}>
                    <Badge
                      className={cn(
                        'rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                        USER_TYPE_BADGE_CLASS_EXTENDED[row.userType]
                      )}
                    >
                      {row.userType}
                    </Badge>
                  </td>
                  <td className={cn(bodyCell, 'whitespace-nowrap text-[#3F3F46] tabular-nums')}>
                    {row.timestampDisplay}
                  </td>
                  {showStatusColumn ? (
                    <td className={bodyCell}>
                      <Badge
                        className={cn(
                          'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                          SEVERITY_BADGE_CLASS_EXTENDED[row.severity]
                        )}
                      >
                        {row.severity}
                      </Badge>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
