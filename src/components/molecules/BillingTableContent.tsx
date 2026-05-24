import * as React from 'react';
import { DataTable, BillingFilters } from '@/components/molecules';
import { EmptyState, ErrorState } from '@/components/atoms';
import type { BillingTableContentProps } from '@/types/billing';

/**
 * Molecule component for billing table content
 * Handles filters, table display, and error/empty states
 */
export default function BillingTableContent({
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
}: BillingTableContentProps): React.JSX.Element {
  // Show error state if error exists
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <BillingFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearFilters={onClearFilters}
        />
        <ErrorState
          message="Failed to load invoices"
          description="Unable to fetch billing data. Please check your connection and try again."
          onRetry={onRetry}
        />
      </div>
    );
  }

  // Show empty state if no data
  if (!isLoading && data.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <BillingFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearFilters={onClearFilters}
        />
        <EmptyState
          message="No invoices found"
          description="There are no invoices matching your current filters. Try adjusting your search criteria or date range."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <BillingFilters
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
      />
    </div>
  );
}
