import {
  endOfMonth,
  endOfWeek,
  format,
  formatDistanceToNow,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from 'date-fns';
import type { AuditLogItemDto } from '@/store/api/auditLogsApi';
import { getOrderStatusLabel } from '@/lib/orderStatusFilter';
import type {
  InvoiceListItem,
  OrderListItemDto,
  OrdersSummaryDataDto,
  OrdersSummaryPeriod,
} from '@/store/api';
import type { InboxNotificationItem } from '@/store/api/notificationsApi';
import type { OrganizationPaymentDetailsDto } from '@/store/api/homeDashboardApi';

export interface HomePeriodOption {
  value: OrdersSummaryPeriod;
  label: string;
}

export interface HomeDateRange {
  startDate: string;
  endDate: string;
}

export interface HomeOrderSummaryCard {
  id: 'total_orders' | 'pickups_on_route' | 'delivered' | 'cancelled' | 'failed' | 'returned';
  title: string;
  current: number;
  changePct: number;
  comparisonLabel: string;
}

/** Dashboard feed row — Team Activity & Notifications (Figma 284-43775). */
export interface HomeFeedListItem {
  id: string;
  message: string;
  timestamp: string;
  unread: boolean;
}

/** @deprecated Use {@link HomeFeedListItem} */
export type HomeActivityItem = HomeFeedListItem;

/** @deprecated Use {@link HomeFeedListItem} */
export type HomeNotificationItem = HomeFeedListItem;

export interface HomeRecentOrderRow {
  id: string;
  orderId: string;
  createdAt: string;
  createdBy: string;
  pickupAddress: string;
  pickupSchedule: string;
  deliveryStopCount: string;
  packageCount: string;
  totalValue: string;
  statusLabel: string;
}

export const HOME_PERIOD_OPTIONS: readonly HomePeriodOption[] = [
  { value: 'TODAY', label: 'Today' },
  { value: 'LAST_7_DAYS', label: 'Last 7 Days' },
  { value: 'LAST_WEEK', label: 'Last Week' },
  { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
  { value: 'LAST_MONTH', label: 'Last Month' },
];

/** Billing overview period — includes all-time (matches Billing → Invoices default). */
export type BillingOverviewPeriod = OrdersSummaryPeriod | 'ALL_TIME';

export interface BillingOverviewPeriodOption {
  value: BillingOverviewPeriod;
  label: string;
}

export const HOME_BILLING_PERIOD_OPTIONS: readonly BillingOverviewPeriodOption[] = [
  { value: 'ALL_TIME', label: 'All time' },
  ...HOME_PERIOD_OPTIONS,
];

export function getBillingDateRange(period: BillingOverviewPeriod): HomeDateRange | undefined {
  if (period === 'ALL_TIME') return undefined;
  return getDateRangeForPeriod(period);
}

export function getBillingPeriodLabel(period: BillingOverviewPeriod): string {
  return HOME_BILLING_PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? 'All time';
}

function parseNumberLike(value: string | number | null | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function formatWholeNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(value);
}

export function formatMoneyGBP(value: string | number | null | undefined): string {
  const num = parseNumberLike(value);
  if (num == null) return '£0';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(num);
}

/** Home billing pills — from `GET /organizations/{id}/payment-details` (not invoices summary). */
export interface HomeBillingKpiItem {
  id: string;
  label: string;
  displayValue: string;
  badgeClassName: string;
}

export function getHomeBillingKpisFromPaymentDetails(
  details: OrganizationPaymentDetailsDto | undefined
): HomeBillingKpiItem[] {
  if (!details) return [];

  const candidates: Array<{
    id: string;
    label: string;
    amount: string | null | undefined;
    badgeClassName: string;
  }> = [
    {
      id: 'paid',
      label: 'Paid',
      amount: details.paid_invoices_amount,
      badgeClassName: 'bg-[rgba(16,185,129,0.1)] text-[#047857]',
    },
    {
      id: 'unpaid',
      label: 'Unpaid',
      amount: details.unpaid_invoices_amount,
      badgeClassName: 'bg-[rgba(245,158,11,0.12)] text-[#B45309]',
    },
    {
      id: 'overdue',
      label: 'Overdue',
      amount: details.overdue_amount,
      badgeClassName: 'bg-[rgba(239,68,68,0.1)] text-[#B91C1C]',
    },
  ];

  return candidates
    .filter((item) => {
      const num = parseNumberLike(item.amount);
      return num != null && num > 0;
    })
    .map((item) => ({
      id: item.id,
      label: item.label,
      displayValue: formatMoneyGBP(item.amount),
      badgeClassName: item.badgeClassName,
    }));
}

export function resolveHomeBillingInvoiceCount(
  paymentDetails: OrganizationPaymentDetailsDto | undefined,
  invoicesListTotal: number | undefined
): number {
  if (paymentDetails?.invoice_count != null && paymentDetails.invoice_count > 0) {
    return paymentDetails.invoice_count;
  }
  return invoicesListTotal ?? 0;
}

/** Order line totals (e.g. recent orders table) — always 2 decimal places. */
export function formatOrderTotalGBP(value: string | number | null | undefined): string {
  const num = parseNumberLike(value);
  if (num == null) return '—';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatMoneyCompact(value: string | number | null | undefined): string {
  const num = parseNumberLike(value);
  if (num == null) return '£0';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '0%';
  return `${Math.round(value)}%`;
}

export function formatDelta(changePct: number | null | undefined): {
  text: string;
  tone: 'positive' | 'negative' | 'neutral';
} {
  if (changePct == null || !Number.isFinite(changePct)) {
    return { text: '0%', tone: 'neutral' };
  }
  if (changePct > 0) return { text: `↑ ${Math.abs(changePct).toFixed(0)}%`, tone: 'positive' };
  if (changePct < 0) return { text: `↓ ${Math.abs(changePct).toFixed(0)}%`, tone: 'negative' };
  return { text: '0%', tone: 'neutral' };
}

export function toApiDate(value: Date): string {
  return format(value, 'yyyy-MM-dd');
}

export function getDateRangeForPeriod(period: OrdersSummaryPeriod): HomeDateRange {
  const today = new Date();
  if (period === 'TODAY') {
    const now = startOfDay(today);
    return { startDate: toApiDate(now), endDate: toApiDate(now) };
  }
  if (period === 'LAST_7_DAYS') {
    return { startDate: toApiDate(subDays(today, 6)), endDate: toApiDate(today) };
  }
  if (period === 'LAST_WEEK') {
    const start = startOfWeek(subDays(today, 7), { weekStartsOn: 1 });
    const end = endOfWeek(subDays(today, 7), { weekStartsOn: 1 });
    return { startDate: toApiDate(start), endDate: toApiDate(end) };
  }
  if (period === 'LAST_30_DAYS') {
    return { startDate: toApiDate(subDays(today, 29)), endDate: toApiDate(today) };
  }
  const prevMonth = subDays(startOfMonth(today), 1);
  const start = startOfMonth(prevMonth);
  const end = endOfMonth(prevMonth);
  return { startDate: toApiDate(start), endDate: toApiDate(end) };
}

export function mapOrdersSummaryToCards(
  summary: OrdersSummaryDataDto | undefined
): HomeOrderSummaryCard[] {
  const comparisonLabel = summary?.comparison_label ?? 'previous period';
  return [
    {
      id: 'total_orders',
      title: 'Total Booking Orders',
      current: summary?.total_orders.current ?? 0,
      changePct: summary?.total_orders.change_pct ?? 0,
      comparisonLabel,
    },
    {
      id: 'pickups_on_route',
      title: 'Pickups On Route',
      current: summary?.pickups_on_route.current ?? 0,
      changePct: summary?.pickups_on_route.change_pct ?? 0,
      comparisonLabel,
    },
    {
      id: 'delivered',
      title: 'Delivered Orders',
      current: summary?.delivered.current ?? 0,
      changePct: summary?.delivered.change_pct ?? 0,
      comparisonLabel,
    },
    {
      id: 'cancelled',
      title: 'Cancelled Orders',
      current: summary?.cancelled.current ?? 0,
      changePct: summary?.cancelled.change_pct ?? 0,
      comparisonLabel,
    },
    {
      id: 'failed',
      title: 'Failed Orders',
      current: summary?.failed.current ?? 0,
      changePct: summary?.failed.change_pct ?? 0,
      comparisonLabel,
    },
    {
      id: 'returned',
      title: 'Returned Orders',
      current: summary?.returned.current ?? 0,
      changePct: summary?.returned.change_pct ?? 0,
      comparisonLabel,
    },
  ];
}

function formatOrderCount(value: number | null | undefined): string {
  if (!Number.isFinite(value)) return '—';
  return String(value).padStart(2, '0');
}

export function formatOrderCreatedDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, 'dd MMM yyyy, hh:mm a');
}

export function mapRecentOrders(items: OrderListItemDto[] | undefined): HomeRecentOrderRow[] {
  return (items ?? []).map((item) => ({
    id: item.id,
    orderId: item.order_id || '—',
    createdAt: item.created_at,
    createdBy: item.created_by?.name?.trim() || '—',
    pickupAddress: item.pickup_address?.trim() || '—',
    pickupSchedule: '—',
    deliveryStopCount: formatOrderCount(item.delivery_stop_count),
    packageCount: formatOrderCount(item.package_count),
    totalValue: formatOrderTotalGBP(item.total_amount),
    statusLabel: getOrderStatusLabel(item.status),
  }));
}

export function mapRecentInvoices(
  items: InvoiceListItem[] | undefined,
  limit = 5
): InvoiceListItem[] {
  return (items ?? []).slice(0, limit);
}

export function mapActivityFeedItems(
  items: AuditLogItemDto[] | undefined,
  limit = 6
): HomeFeedListItem[] {
  return (items ?? []).slice(0, limit).map((item) => ({
    id: item.id,
    message: formatActivityFeedMessage(item),
    timestamp: item.created_at,
    unread: true,
  }));
}

export function mapNotifications(
  items: InboxNotificationItem[] | undefined,
  limit = 6
): HomeFeedListItem[] {
  return (items ?? []).slice(0, limit).map((item) => ({
    id: item.id,
    message: item.body?.trim() || item.subject?.trim() || statusToBadgeLabel(item.event),
    timestamp: item.created_at,
    unread: item.is_read !== true,
  }));
}

export function formatRelativeTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return formatDistanceToNow(date, { addSuffix: true });
}

function formatActivityFeedMessage(item: AuditLogItemDto): string {
  const event = item.event?.trim();
  if (event) {
    const actor = item.actor?.trim();
    if (actor && !event.toLowerCase().startsWith(actor.toLowerCase())) {
      return `${actor} ${event}`;
    }
    return event;
  }

  const actor = item.actor?.trim() || 'Someone';
  const action =
    item.action_label?.trim() ||
    item.display_category?.trim() ||
    statusToBadgeLabel(item.event_type);
  const suffix = action.endsWith('.') ? action : `${action}.`;
  return `${actor} ${suffix}`;
}

export function formatDateTimeShort(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, 'dd MMM yyyy, HH:mm');
}

export function formatDateMedium(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, 'dd MMM yyyy');
}

export function statusToBadgeLabel(value: string): string {
  return value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}
