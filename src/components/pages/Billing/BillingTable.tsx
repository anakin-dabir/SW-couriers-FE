import { useState, useMemo } from 'react';
import { type DateRange } from 'react-day-picker';
import { MOCK_BILLING_DATA } from '@/lib/data';
import { BILLING_ITEMS_PER_PAGE, filterBillingData, paginateData } from '@/lib/billing';
import {
  BillingTableContent,
  getBillingTableColumns,
  type BillingFiltersState,
} from '@/components/pages/Billing';
import type { PaymentStatus } from '@/types/billing';

export interface BillingTableProps {
  /** Date range filter from parent */
  dateRange?: DateRange;
  /** Initial status filter from route (e.g. /billing/paid-invoices) */
  initialStatus?: PaymentStatus | '';
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Retry handler for error state */
  onRetry?: () => void;
  /** Invoice click handler */
  onInvoiceClick?: (invoiceNumber: string) => void;
}

/**
 * Organism component for billing invoices table
 * Displays invoice list with status and actions
 */
export default function BillingTable({
  dateRange,
  initialStatus,
  isLoading = false,
  error = null,
  onRetry,
  onInvoiceClick,
}: BillingTableProps): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BillingFiltersState>({
    search: '',
    status: initialStatus ?? '',
  });

  // Get column definitions
  const columns = useMemo(() => getBillingTableColumns({ onInvoiceClick }), [onInvoiceClick]);

  // Filter data based on current filters and date range
  const filteredData = useMemo(
    () => filterBillingData(MOCK_BILLING_DATA, dateRange, filters),
    [filters, dateRange]
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / BILLING_ITEMS_PER_PAGE);
  const paginatedData = useMemo(
    () => paginateData(filteredData, currentPage, BILLING_ITEMS_PER_PAGE),
    [filteredData, currentPage]
  );

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: BillingFiltersState): void => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = (): void => {
    setFilters({
      search: '',
      status: '',
    });
    setCurrentPage(1);
  };

  return (
    <BillingTableContent
      columns={columns}
      data={paginatedData}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onClearFilters={handleClearFilters}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
    />
  );
}
