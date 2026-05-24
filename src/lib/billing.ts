/**
 * Billing utilities and constants
 */

import { type DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import type { BillingInvoice, PaymentStatus } from '@/types/billing';
import type { BillingFiltersState } from '@/components/molecules/BillingFilters';

/** Items per page for pagination */
export const BILLING_ITEMS_PER_PAGE = 5;

/**
 * Filter billing data based on date range and filters
 */
export function filterBillingData(
  data: BillingInvoice[],
  dateRange?: DateRange,
  filters?: BillingFiltersState
): BillingInvoice[] {
  let result = [...data];

  // Date range filter
  if (
    dateRange &&
    dateRange.from &&
    dateRange.to &&
    dateRange.from instanceof Date &&
    dateRange.to instanceof Date
  ) {
    const fromDate = dateRange.from;
    const toDate = dateRange.to;
    const fromDateStr = format(fromDate, 'yyyy-MM-dd');
    const toDateStr = format(toDate, 'yyyy-MM-dd');
    result = result.filter(
      (invoice) => invoice.issueDate >= fromDateStr && invoice.issueDate <= toDateStr
    );
  }

  // Search filter (invoice number or delivery ref)
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
        invoice.deliveryRef.toLowerCase().includes(searchLower)
    );
  }

  // Status filter
  if (filters?.status) {
    result = result.filter((invoice) => invoice.status === filters.status);
  }

  return result;
}

/**
 * Paginate data array
 */
export function paginateData<T>(data: T[], currentPage: number, itemsPerPage: number): T[] {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
}

/**
 * Get actions for invoice based on payment status
 */
export function getBillingActionsForStatus(
  status: PaymentStatus,
  invoice: BillingInvoice,
  onInvoiceClick?: (invoiceNumber: string) => void
): { label: string; onClick: () => void }[] {
  const viewAction = {
    label: 'View',
    onClick: () =>
      onInvoiceClick
        ? onInvoiceClick(invoice.invoiceNumber)
        : console.log('View:', invoice.invoiceNumber),
  };

  const payNowAction = {
    label: 'Pay Now',
    onClick: () => console.log('Pay Now:', invoice.invoiceNumber),
  };

  // Actions based on status (as per Figma annotation)
  // If UNPAID or OVERDUE: View, Pay Now
  // If PAID: View only (Pay Now not needed)
  if (status === 'paid') {
    return [viewAction];
  }

  return [viewAction, payNowAction];
}

/**
 * Handle invoice click
 * Updates URL with invoiceId query param
 */
export function handleBillingInvoiceClick(
  invoiceNumber: string,
  navigate: (path: string, options?: { replace?: boolean }) => void | Promise<void>,
  location: { pathname: string; search: string }
): void {
  const searchParams = new URLSearchParams(location.search);
  searchParams.set('invoiceId', invoiceNumber);
  void navigate(`${location.pathname}?${searchParams.toString()}`, { replace: false });
}
