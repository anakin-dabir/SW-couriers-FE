import * as React from 'react';
import { cn } from '@/lib/utils';
import { Typography } from '@/components/atoms';
import Pagination from './Pagination';
import DesktopTableView from './DesktopTableView';
import MobileCardView from './MobileCardView';
import type { DataTableProps } from '@/types/datatable';

/**
 * Molecule component for styled data table
 * Matches the Figma design with rounded rows and custom styling
 * Shows cards on mobile, table on desktop
 */
export default function DataTable<T = Record<string, unknown>>({
  columns,
  data,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = data.length || 1,
  totalEntries = data.length,
  onPageSizeChange,
  isLoading = false,
  skeletonRowCount = 6,
  showPagination = true,
  className,
  tableSectionClassName,
  tableHorizontalScrollClassName,
  tableScrollMinWidthClassName,
  getRowKey,
  onRowClick,
  getRowClassName,
}: DataTableProps<T>): React.JSX.Element {
  const normalizedPageSize =
    typeof pageSize === 'number' && Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 1;
  const normalizedTotalEntries =
    typeof totalEntries === 'number' && Number.isFinite(totalEntries) && totalEntries >= 0
      ? totalEntries
      : 0;
  const normalizedSkeletonRowCount =
    typeof skeletonRowCount === 'number' &&
    Number.isFinite(skeletonRowCount) &&
    skeletonRowCount > 0
      ? Math.floor(skeletonRowCount)
      : 6;

  const handlePageChange = (page: number): void => {
    if (typeof onPageChange !== 'function') return;
    const safePage = Math.min(Math.max(page, 1), Math.max(1, totalPages));
    onPageChange(safePage);
  };
  const emitPageSizeChange = (nextSize: number): void => {
    if (typeof onPageSizeChange !== 'function') return;
    const callback = onPageSizeChange as (size: number) => void;
    callback(nextSize);
  };

  const entriesStart =
    normalizedTotalEntries === 0 ? 0 : (currentPage - 1) * normalizedPageSize + 1;
  const entriesEnd = Math.min(normalizedTotalEntries, currentPage * normalizedPageSize);
  const showFooter = showPagination && !isLoading && normalizedTotalEntries > 0;

  const scrollDesktopTable = (node: React.ReactNode): React.ReactNode =>
    tableHorizontalScrollClassName ? (
      <div
        className={cn('overflow-x-auto max-md:overflow-x-visible', tableHorizontalScrollClassName)}
      >
        {node}
      </div>
    ) : (
      node
    );

  const desktopSkeletonTable = (
    <div
      className={cn(
        'hidden rounded-md md:block',
        tableHorizontalScrollClassName ? cn(tableScrollMinWidthClassName) : 'border'
      )}
    >
      <div
        className={cn(
          'h-11 rounded-t-md bg-muted/40',
          tableHorizontalScrollClassName ? 'border-b border-[#E5E7EB]' : 'border-b'
        )}
      />
      <div className="space-y-2 p-3">
        {Array.from({ length: normalizedSkeletonRowCount }).map((_, index) => (
          <div
            key={`desktop-skeleton-${index}`}
            className="h-12 animate-pulse rounded-md bg-muted/60"
          />
        ))}
      </div>
    </div>
  );

  const loadedTableSection = (
    <div
      className={cn(
        'rounded-md bg-background p-3 md:p-4',
        tableSectionClassName,
        tableHorizontalScrollClassName ? tableScrollMinWidthClassName : undefined
      )}
    >
      <DesktopTableView
        columns={columns}
        data={data}
        getRowKey={getRowKey}
        onRowClick={onRowClick}
        getRowClassName={getRowClassName}
      />
      <MobileCardView
        columns={columns}
        data={data}
        getRowKey={getRowKey}
        onRowClick={onRowClick}
        getRowClassName={getRowClassName}
      />
    </div>
  );

  return (
    <div className={cn('w-full space-y-4', className)}>
      {isLoading ? (
        <>
          {scrollDesktopTable(desktopSkeletonTable)}
          <div className="flex flex-col gap-2 md:hidden">
            {Array.from({ length: Math.min(3, normalizedSkeletonRowCount) }).map((_, index) => (
              <div
                key={`mobile-skeleton-${index}`}
                className="h-24 animate-pulse rounded-md bg-muted/60"
              />
            ))}
          </div>
        </>
      ) : (
        scrollDesktopTable(loadedTableSection)
      )}

      {showFooter && (
        <div className="flex flex-col gap-3 border-t border-gray-200/70 pt-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Typography variant="caption" className="font-medium text-form-title">
              Show
            </Typography>
            <select
              value={String(normalizedPageSize)}
              disabled={typeof onPageSizeChange !== 'function'}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                const nextSize = Number.parseInt(event.currentTarget.value, 10);
                if (Number.isFinite(nextSize)) {
                  emitPageSizeChange(nextSize);
                }
              }}
              className="h-8 rounded-md border border-form-border-light bg-form-surface px-2.5 text-sm text-form-title focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {[10, 15, 25, 50, 100].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Typography variant="caption" className="text-form-subtitle">
              {`${entriesStart}-${entriesEnd} entries out of ${normalizedTotalEntries}`}
            </Typography>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, totalPages)}
            onPageChange={handlePageChange}
            className="justify-center md:justify-end"
          />
        </div>
      )}
    </div>
  );
}
