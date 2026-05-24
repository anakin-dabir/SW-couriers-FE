import * as React from 'react';
import { DataTable, DeliveriesFilters } from '@/components/molecules';
import { EmptyState, ErrorState } from '@/components/atoms';
import type { DeliveryTableContentProps } from '@/types/delivery';

/**
 * Molecule component for deliveries table content
 * Handles filters, table display, and error/empty states
 */
export default function DeliveriesTableContent({
  columns,
  data,
  currentPage,
  totalPages,
  onPageChange,
  filters,
  onFiltersChange,
  onClearFilters,
  isLoading = false,
  error = null,
  onRetry,
  onRowClick,
}: DeliveryTableContentProps): React.JSX.Element {
  // Show error state if error exists
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <DeliveriesFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearFilters={onClearFilters}
        />
        <ErrorState
          message="Failed to load deliveries"
          description="Unable to fetch delivery data. Please check your connection and try again."
          onRetry={onRetry}
        />
      </div>
    );
  }

  // Show empty state if no data
  if (!isLoading && data.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <DeliveriesFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearFilters={onClearFilters}
        />
        <EmptyState
          message="No deliveries found"
          description="There are no deliveries matching your current filters. Try adjusting your search criteria or date range."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DeliveriesFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        onClearFilters={onClearFilters}
      />

      <DataTable
        columns={columns}
        data={data}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        getRowKey={(row) => String(row.id)}
        onRowClick={onRowClick}
      />
    </div>
  );
}
