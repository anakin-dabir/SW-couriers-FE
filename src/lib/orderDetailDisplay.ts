import { format, parseISO, isValid } from 'date-fns';
import { statusBadgeClass } from './statusColors';

export type OrderServiceTierKey =
  | 'FASTEST'
  | 'STANDARD'
  | 'ECONOMY'
  | 'PREMIUM'
  | 'EXPRESS'
  | 'OTHER';

export function formatOrderCurrency(value?: string | number | null): string {
  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value.replace(/,/g, ''))
        : NaN;
  if (!Number.isFinite(numeric)) return '£ 0.00';
  return `£ ${numeric.toFixed(2)}`;
}

function safeParse(value: string): Date | null {
  const iso = value.length >= 10 && !value.includes('T') ? `${value.slice(0, 10)}T00:00:00` : value;
  const parsed = parseISO(iso);
  if (isValid(parsed)) return parsed;
  const fallback = new Date(value);
  return isValid(fallback) ? fallback : null;
}

export function formatOrderDate(value?: string | null): string {
  if (!value) return '—';
  const parsed = safeParse(value);
  return parsed ? format(parsed, 'dd MMMM yyyy') : value;
}

export function formatOrderDateTime(value?: string | null): string {
  if (!value) return '—';
  const parsed = safeParse(value);
  return parsed ? format(parsed, 'dd MMM yyyy - hh:mm a') : value;
}

export function normalizeServiceTierKey(tier?: string | null): OrderServiceTierKey {
  const u = (tier ?? '').toUpperCase().replace(/-/g, '_');
  if (u.includes('PREMIUM')) return 'PREMIUM';
  if (u.includes('EXPRESS')) return 'EXPRESS';
  if (u.includes('FAST') || u.includes('4_DAY') || u.includes('4DAY')) return 'FASTEST';
  if (u.includes('ECON')) return 'ECONOMY';
  if (u.includes('STANDARD') || u.includes('5_DAY') || u.includes('5DAY')) return 'STANDARD';
  return 'OTHER';
}

export function serviceTierDisplayLabel(tier?: string | null): string {
  const key = normalizeServiceTierKey(tier);
  if (key === 'FASTEST') return 'FASTEST';
  if (key === 'ECONOMY') return 'ECONOMY';
  if (key === 'STANDARD') return 'STANDARD';
  if (key === 'PREMIUM') return 'PREMIUM';
  if (key === 'EXPRESS') return 'EXPRESS';
  return (tier ?? '—').replace(/_/g, ' ').toUpperCase();
}

export function orderStatusBadgeClassName(status: string): string {
  return `rounded-xl border-none px-5 py-2 text-[13px] font-medium shadow-sm ${statusBadgeClass(status)}`;
}

export function stopStatusBadgeClassName(status?: string | null): string {
  return `inline-flex h-6 items-center rounded-full border-transparent px-3 text-[11px] font-semibold leading-none ${statusBadgeClass(status)}`;
}

export function mapPaymentMethodDisplayLabel(method?: string | null): string {
  if (!method) return '—';
  const u = method.toUpperCase();
  if (u.includes('CARD')) return 'Card Payment';
  if (u.includes('BANK')) return 'Bank Transfer';
  if (u.includes('CREDIT')) return 'Credit Account';
  if (u.includes('CASH')) return 'Cash';
  return method
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function mapPaymentStatusDisplayLabel(status?: string | null): string {
  if (!status) return 'Pending';
  const u = status.toUpperCase();
  if (u.includes('PAID')) return 'Paid';
  if (u.includes('PARTIAL')) return 'Partially Paid';
  if (u.includes('UNPAID')) return 'Unpaid';
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const ORDER_DETAIL_SECTION_SHELL =
  'w-full overflow-hidden rounded-[12px] border border-[#CBCBD8] bg-white shadow-none';

export const ORDER_DETAIL_SECTION_HEADER =
  'flex items-center justify-between rounded-t-[12px] border-b border-[#F1F1F5] bg-[#FBFBFC] px-4 py-2';
