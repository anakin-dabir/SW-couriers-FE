import { useState, useMemo } from 'react';
import { type DateRange } from 'react-day-picker';
import { MOCK_DELIVERY_DATA } from '@/lib/data';
import {
  DELIVERY_ITEMS_PER_PAGE,
  filterDeliveryData,
  paginateDeliveryData,
} from '@/lib/deliveries';
import { DeliveriesTableContent, getDeliveriesTableColumns } from '@/components/molecules';
import type { DeliveryFiltersState } from '@/components/molecules/DeliveriesFilters';

interface DeliveriesTableProps {
  /** Date range filter from parent */
  dateRange?: DateRange;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Retry handler for error state */
  onRetry?: () => void;
  /** Delivery click handler */
  onDeliveryClick?: (trackingId: string) => void;
}

/**
 * Organism component for deliveries table
 * Displays delivery list with status and actions
 */
export default function DeliveriesTable({
  dateRange,
  isLoading = false,
  error = null,
  onRetry,
  onDeliveryClick,
}: DeliveriesTableProps): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<DeliveryFiltersState>({
    search: '',
    status: '',
    fromDate: undefined,
    toDate: undefined,
  });

  // Get column definitions
  const columns = useMemo(
    () => getDeliveriesTableColumns({ onDeliveryClick, variant: 'list' }),
    [onDeliveryClick]
  );

  // Filter data based on current filters and date range
  const filteredData = useMemo(
    () => filterDeliveryData(MOCK_DELIVERY_DATA, dateRange, filters),
    [filters, dateRange]
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / DELIVERY_ITEMS_PER_PAGE);
  const paginatedData = useMemo(
    () => paginateDeliveryData(filteredData, currentPage, DELIVERY_ITEMS_PER_PAGE),
    [filteredData, currentPage]
  );

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: DeliveryFiltersState): void => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = (): void => {
    setFilters({
      search: '',
      status: '',
      fromDate: undefined,
      toDate: undefined,
    });
    setCurrentPage(1);
  };

  return (
    <DeliveriesTableContent
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
      onRowClick={(row) => onDeliveryClick?.(row.trackingId)}
    />
  );
}
