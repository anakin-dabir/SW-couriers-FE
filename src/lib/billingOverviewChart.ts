import type { InvoiceListItem, InvoicePaymentStatus } from '@/store/api/invoicesApi';

/** Display order top → bottom (Figma home billing overview). */
export const BILLING_OVERVIEW_STATUS_ORDER: readonly InvoicePaymentStatus[] = [
  'REFUNDED',
  'DISPUTED',
  'VOID',
  'WRITTEN_OFF',
  'OVERDUE',
  'PARTIALLY_PAID',
  'PAID',
  'UNPAID',
] as const;

export interface BillingOverviewStatusConfig {
  label: string;
  barColor: string;
  badgeClassName: string;
}

export const BILLING_OVERVIEW_STATUS_CONFIG: Record<
  (typeof BILLING_OVERVIEW_STATUS_ORDER)[number],
  BillingOverviewStatusConfig
> = {
  REFUNDED: {
    label: 'Refunded',
    barColor: '#3B82F6',
    badgeClassName: 'bg-[rgba(59,130,246,0.15)] text-[#1D4ED8]',
  },
  DISPUTED: {
    label: 'Disputed',
    barColor: '#F59E0B',
    badgeClassName: 'bg-[rgba(245,158,11,0.15)] text-[#B45309]',
  },
  VOID: {
    label: 'Void',
    barColor: '#8B5CF6',
    badgeClassName: 'bg-[rgba(139,92,246,0.15)] text-[#6D28D9]',
  },
  WRITTEN_OFF: {
    label: 'Written Off',
    barColor: '#64748B',
    badgeClassName: 'bg-[rgba(100,116,139,0.15)] text-[#475569]',
  },
  OVERDUE: {
    label: 'Overdue',
    barColor: '#EF4444',
    badgeClassName: 'bg-[rgba(239,68,68,0.15)] text-[#B91C1C]',
  },
  PARTIALLY_PAID: {
    label: 'Partially Paid',
    barColor: '#059669',
    badgeClassName: 'bg-[rgba(4,120,87,0.15)] text-[#047857]',
  },
  PAID: {
    label: 'Paid',
    barColor: '#10B981',
    badgeClassName: 'bg-[rgba(16,185,129,0.15)] text-[#047857]',
  },
  UNPAID: {
    label: 'Unpaid',
    barColor: '#1E293B',
    badgeClassName: 'bg-[rgba(30,41,59,0.12)] text-[#1E293B]',
  },
};

export interface BillingOverviewChartRow {
  status: InvoicePaymentStatus;
  label: string;
  totalValue: number;
  invoiceCount: number;
  barColor: string;
  badgeClassName: string;
}

function parseAmount(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function createEmptyTotals(): Map<
  InvoicePaymentStatus,
  { totalValue: number; invoiceCount: number }
> {
  const totals = new Map<InvoicePaymentStatus, { totalValue: number; invoiceCount: number }>();
  for (const status of BILLING_OVERVIEW_STATUS_ORDER) {
    totals.set(status, { totalValue: 0, invoiceCount: 0 });
  }
  return totals;
}

/** Monetary value for chart bars — outstanding statuses use balance, not full invoice total. */
export function chartAmountForInvoice(invoice: InvoiceListItem): number {
  const total = parseAmount(invoice.total);
  const balance = parseAmount(invoice.balance);
  const paid = parseAmount(invoice.paid);
  const refunded = parseAmount(invoice.refunded_amount);

  switch (invoice.payment_status) {
    case 'PAID':
      return paid > 0 ? paid : total;
    case 'PARTIALLY_PAID':
      return balance > 0 ? balance : Math.max(0, total - paid);
    case 'UNPAID':
    case 'OVERDUE':
      return balance > 0 ? balance : total;
    case 'REFUNDED':
      return refunded > 0 ? refunded : total;
    default:
      return total;
  }
}

function applyPortalFilterDimensions(
  totals: Map<InvoicePaymentStatus, { totalValue: number; invoiceCount: number }>,
  items: InvoiceListItem[]
): void {
  for (const invoice of items) {
    const refunded = parseAmount(invoice.refunded_amount);
    if (refunded > 0 && invoice.payment_status !== 'REFUNDED') {
      const entry = totals.get('REFUNDED')!;
      entry.invoiceCount += 1;
      entry.totalValue += refunded;
    }

    if (invoice.has_open_dispute && invoice.payment_status !== 'DISPUTED') {
      const entry = totals.get('DISPUTED')!;
      entry.invoiceCount += 1;
      entry.totalValue += parseAmount(invoice.balance) || parseAmount(invoice.total);
    }
  }
}

function totalsToRows(
  totals: Map<InvoicePaymentStatus, { totalValue: number; invoiceCount: number }>
): BillingOverviewChartRow[] {
  return BILLING_OVERVIEW_STATUS_ORDER.map((status) => {
    const config = BILLING_OVERVIEW_STATUS_CONFIG[status];
    const entry = totals.get(status)!;
    return {
      status,
      label: config.label,
      totalValue: entry.totalValue,
      invoiceCount: entry.invoiceCount,
      barColor: config.barColor,
      badgeClassName: config.badgeClassName,
    };
  });
}

/**
 * Home billing overview — all Figma rows + portal REFUNDED/DISPUTED dimensions.
 * Counts/values come from the invoice list only (not Billing → Invoices summary KPIs).
 */
export function aggregateHomeBillingOverviewRows(
  items: InvoiceListItem[] | undefined
): BillingOverviewChartRow[] {
  const totals = createEmptyTotals();

  for (const invoice of items ?? []) {
    const status = invoice.payment_status;
    if (!totals.has(status)) continue;
    const entry = totals.get(status)!;
    entry.invoiceCount += 1;
    entry.totalValue += chartAmountForInvoice(invoice);
  }

  applyPortalFilterDimensions(totals, items ?? []);

  return totalsToRows(totals);
}

/** @deprecated Use {@link aggregateHomeBillingOverviewRows} on the home dashboard. */
export function aggregateBillingOverviewRows(
  items: InvoiceListItem[] | undefined
): BillingOverviewChartRow[] {
  return aggregateHomeBillingOverviewRows(items);
}

export function computeBillingChartMaxValue(rows: BillingOverviewChartRow[]): number {
  const max = Math.max(0, ...rows.map((row) => row.totalValue));
  if (max === 0) return 14000;
  const step = 2000;
  return Math.ceil(max / step) * step;
}

export function formatBillingAxisValue(value: number): string {
  if (value >= 1000) {
    const compact = value / 1000;
    return `£${Number.isInteger(compact) ? compact : compact.toFixed(0)}k`;
  }
  return `£${value}`;
}

export function formatBillingTooltipMoney(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value);
}
