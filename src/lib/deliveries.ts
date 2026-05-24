/**
 * Deliveries utilities and constants
 */

import { type DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import type { Delivery, DeliveryStatus } from '@/types/delivery';
import type { DeliveryFiltersState } from '@/components/molecules';

/** Items per page for pagination */
export const DELIVERY_ITEMS_PER_PAGE = 10;

/**
 * Filter delivery data based on date range and filters
 */
export function filterDeliveryData(
  data: Delivery[],
  dateRange?: DateRange,
  filters?: DeliveryFiltersState
): Delivery[] {
  let result = [...data];

  // Date range filter - prioritize filters dates over dateRange prop
  const fromDate = filters?.fromDate || dateRange?.from;
  const toDate = filters?.toDate || dateRange?.to;

  if (fromDate && toDate && fromDate instanceof Date && toDate instanceof Date) {
    const fromDateStr = format(fromDate, 'yyyy-MM-dd');
    const toDateStr = format(toDate, 'yyyy-MM-dd');
    result = result.filter(
      (delivery) => delivery.createdAt >= fromDateStr && delivery.createdAt <= toDateStr
    );
  } else if (fromDate && fromDate instanceof Date) {
    // Only from date
    const fromDateStr = format(fromDate, 'yyyy-MM-dd');
    result = result.filter((delivery) => delivery.createdAt >= fromDateStr);
  } else if (toDate && toDate instanceof Date) {
    // Only to date
    const toDateStr = format(toDate, 'yyyy-MM-dd');
    result = result.filter((delivery) => delivery.createdAt <= toDateStr);
  }

  // Search filter (tracking ID, recipient name, or address)
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(
      (delivery) =>
        delivery.trackingId.toLowerCase().includes(searchLower) ||
        delivery.recipientName.toLowerCase().includes(searchLower) ||
        delivery.recipientAddress.toLowerCase().includes(searchLower)
    );
  }

  // Status filter
  if (filters?.status) {
    result = result.filter((delivery) => delivery.status === filters.status);
  }

  return result;
}

/**
 * Paginate data array
 */
export function paginateDeliveryData<T>(data: T[], currentPage: number, itemsPerPage: number): T[] {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
}

/**
 * Get actions for delivery based on status
 */
export function getDeliveryActionsForStatus(
  status: DeliveryStatus,
  delivery: Delivery
): { label: string; onClick: () => void }[] {
  const viewAction = {
    label: 'View',
    onClick: () => console.log('View:', delivery.trackingId),
  };

  const trackAction = {
    label: 'Track',
    onClick: () => console.log('Track:', delivery.trackingId),
  };

  const cancelAction = {
    label: 'Cancel',
    onClick: () => console.log('Cancel:', delivery.trackingId),
  };

  // Actions based on status
  if (status === 'delivered' || status === 'failed') {
    return [viewAction];
  }

  if (status === 'pending') {
    return [viewAction, trackAction, cancelAction];
  }

  // in-transit
  return [viewAction, trackAction];
}
