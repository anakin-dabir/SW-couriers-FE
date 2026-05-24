import type {
  OrganizationPaymentMethodDto,
  PaymentMethodDistributionDto,
} from '@/store/api/homeDashboardApi';
import { statusToBadgeLabel } from '@/lib/homeDashboard';

export const ACCOUNTS_DETAILS_SECTION_CLASS =
  'flex flex-col gap-5 rounded-xl border border-[#E5E7EB] bg-white p-6';

export const SW_COURIERS_BANK_DETAILS = {
  accountName: 'SW Couriers Ltd',
  accountNumber: '12345678',
  sortCode: '20-45-78',
} as const;

export type PaymentModelKind = 'card' | 'bank_transfer' | 'credit_account' | 'cash';

const PAYMENT_MODEL_ORDER: PaymentModelKind[] = ['card', 'bank_transfer', 'credit_account', 'cash'];

export function normalizePaymentModel(value: string | null | undefined): PaymentModelKind | null {
  const normalized = value?.trim().toUpperCase().replace(/-/g, '_') ?? '';
  if (!normalized) return null;
  if (normalized.includes('CARD')) return 'card';
  if (normalized.includes('BANK')) return 'bank_transfer';
  if (normalized.includes('CREDIT')) return 'credit_account';
  if (normalized.includes('CASH')) return 'cash';
  return null;
}

export function paymentModelLabel(kind: PaymentModelKind): string {
  switch (kind) {
    case 'card':
      return 'Card';
    case 'bank_transfer':
      return 'Bank Transfer';
    case 'credit_account':
      return 'Credit Account';
    case 'cash':
      return 'Cash (In-Person)';
    default:
      return 'Payment Method';
  }
}

/** Dashboard / overview pill label (matches Figma). */
export function paymentModelDisplayLabel(kind: PaymentModelKind): string {
  switch (kind) {
    case 'card':
      return 'Card Payment';
    case 'bank_transfer':
      return 'Bank Transfer';
    case 'credit_account':
      return 'Credit Account';
    case 'cash':
      return 'Cash';
    default:
      return 'Payment Method';
  }
}

export interface PaymentMethodUtilizationItem {
  id: string;
  label: string;
  amount: number;
  color: string;
}

export function paymentModelUtilizationLabel(kind: PaymentModelKind): string {
  switch (kind) {
    case 'card':
      return 'Card Payments';
    case 'bank_transfer':
      return 'Bank Transfer';
    case 'credit_account':
      return 'Credit Account';
    case 'cash':
      return 'Cash';
    default:
      return 'Payment Method';
  }
}

export function paymentModelChartColor(kind: PaymentModelKind): string {
  switch (kind) {
    case 'card':
      return '#9162F3';
    case 'bank_transfer':
      return '#1ABBB9';
    case 'credit_account':
      return '#3B82F6';
    case 'cash':
      return '#F97316';
    default:
      return '#71717A';
  }
}

export function mapMethodDistributionToUtilization(
  distribution: PaymentMethodDistributionDto[] | undefined
): PaymentMethodUtilizationItem[] {
  return (distribution ?? []).flatMap((entry) => {
    const kind = normalizePaymentModel(entry.model);
    if (!kind) return [];
    const charged = entry.total_charged;
    const numeric =
      typeof charged === 'string'
        ? Number(charged.replace(/,/g, ''))
        : typeof charged === 'number'
          ? charged
          : Number(entry.order_count ?? 0);
    const item: PaymentMethodUtilizationItem = {
      id: kind,
      label: paymentModelUtilizationLabel(kind),
      amount: Number.isFinite(numeric) ? numeric : 0,
      color: paymentModelChartColor(kind),
    };
    return [item];
  });
}

/** Static dashboard preview — matches Figma utilization card. */
export const PAYMENT_METHOD_UTILIZATION_DUMMY: PaymentMethodUtilizationItem[] = [
  { id: 'card', label: 'Card Payments', amount: 7420, color: '#9162F3' },
  { id: 'bank_transfer', label: 'Bank Transfer', amount: 3800, color: '#1ABBB9' },
  { id: 'credit_account', label: 'Credit Account', amount: 1200, color: '#3B82F6' },
  { id: 'cash', label: 'Cash', amount: 5200, color: '#F97316' },
];

export function paymentModelBadgeClassName(kind: PaymentModelKind): string {
  switch (kind) {
    case 'card':
      return 'bg-[#7C3AED] text-white';
    case 'bank_transfer':
      return 'bg-[#0F766E] text-white';
    case 'credit_account':
      return 'bg-[#1D4ED8] text-white';
    case 'cash':
      return 'bg-[#C2410C] text-white';
    default:
      return 'bg-[#52525B] text-white';
  }
}

function ordinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function formatDaysAfterOrderLabel(days: number): string {
  if (days === 1) return '1 day after order';
  return `${days} days after order`;
}

export function formatBillingScheduleLabel(
  value: string | null | undefined,
  billingDayOfMonth?: number | null,
  billingDaysAfterOrder?: number | null
): string {
  if (!value?.trim()) {
    if (billingDayOfMonth != null) {
      return `${billingDayOfMonth}${ordinalSuffix(billingDayOfMonth)} of every month`;
    }
    if (billingDaysAfterOrder != null) {
      return formatDaysAfterOrderLabel(billingDaysAfterOrder);
    }
    return '—';
  }
  const upper = value.trim().toUpperCase().replace(/-/g, '_');
  if (upper.includes('IMMEDIATE')) return 'Immediate';
  if (upper.includes('NET_30') || (upper.includes('NET') && upper.includes('30'))) {
    return 'Net 30 days';
  }
  if (upper.includes('DAYS_AFTER_ORDER') || upper.includes('DAYS_AFTER')) {
    if (billingDaysAfterOrder != null) {
      return formatDaysAfterOrderLabel(billingDaysAfterOrder);
    }
    return 'Days after order';
  }
  if (upper.includes('MONTHLY') && billingDayOfMonth != null) {
    return `${billingDayOfMonth}${ordinalSuffix(billingDayOfMonth)} of every month`;
  }
  if (upper.includes('MONTHLY')) return 'Monthly';
  return statusToBadgeLabel(value.replace(/_/g, ' '));
}

export function indexPaymentMethodsByModel(
  methods: OrganizationPaymentMethodDto[] | undefined
): Partial<Record<PaymentModelKind, OrganizationPaymentMethodDto>> {
  const map: Partial<Record<PaymentModelKind, OrganizationPaymentMethodDto>> = {};
  for (const method of methods ?? []) {
    const kind = normalizePaymentModel(method.payment_model);
    if (kind && !map[kind]) map[kind] = method;
  }
  return map;
}

export function listConfiguredPaymentModels(
  methods: OrganizationPaymentMethodDto[] | undefined
): PaymentModelKind[] {
  const configured = new Set<PaymentModelKind>();
  for (const method of methods ?? []) {
    const kind = normalizePaymentModel(method.payment_model);
    if (kind) configured.add(kind);
  }
  if (configured.size === 0) return ['card'];
  return PAYMENT_MODEL_ORDER.filter((kind) => configured.has(kind));
}

export function resolveDefaultPaymentModel(
  methods: OrganizationPaymentMethodDto[] | undefined
): PaymentModelKind {
  const explicit = (methods ?? []).find((m) => m.is_default === true);
  const fromExplicit = normalizePaymentModel(explicit?.payment_model);
  if (fromExplicit) return fromExplicit;
  const available = listConfiguredPaymentModels(methods);
  return available[0] ?? 'card';
}

export function formatGbpAmount(value: string | number | null | undefined): string {
  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value.replace(/,/g, ''))
        : NaN;
  if (!Number.isFinite(numeric)) return '£0.00';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}
