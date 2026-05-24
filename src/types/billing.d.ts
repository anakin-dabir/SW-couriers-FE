/**
 * Type definitions for Billing components
 */

import type { StatItem } from './stats';
import type { BillingFiltersState } from '@/components/molecules/BillingFilters';
import type { Column } from './datatable';

export type PaymentStatus = 'paid' | 'unpaid' | 'overdue';

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  deliveryRef: string;
  value: string;
  paymentDate: string;
  status: PaymentStatus;
}

export type BillingStat = StatItem;

export interface BillingStatsData {
  totalUnpaid: BillingStat;
  overdueInvoices: BillingStat;
  unpaidInvoices: BillingStat;
  paidInvoices: BillingStat;
}

export interface BillingTableContentProps {
  /** Table columns */
  columns: Column<BillingInvoice>[];
  /** Table data */
  data: BillingInvoice[];
  /** Current page */
  currentPage: number;
  /** Total pages */
  totalPages: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Current filters */
  filters: BillingFiltersState;
  /** Filter change handler */
  onFiltersChange: (filters: BillingFiltersState) => void;
  /** Clear filters handler */
  onClearFilters: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Retry handler */
  onRetry?: () => void;
}
