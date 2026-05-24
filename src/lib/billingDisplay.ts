import { format, parseISO } from 'date-fns';
import type { InvoiceLifecycleStatus, InvoicePaymentStatus } from '@/store/api';

export const INVOICE_STATUS_LABELS: Record<InvoiceLifecycleStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
};

export const INVOICE_PAYMENT_STATUS_LABELS: Record<InvoicePaymentStatus, string> = {
  UNPAID: 'Unpaid',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  VOID: 'Void',
  WRITTEN_OFF: 'Written Off',
  REFUNDED: 'Refunded',
  DISPUTED: 'Disputed',
};

export function formatApiDate(value?: string | null): string {
  if (!value) return '-';
  try {
    const raw = value.length >= 10 ? value.slice(0, 10) : value;
    return format(parseISO(raw), 'dd MMM yyyy');
  } catch {
    return '-';
  }
}

export function formatCurrencyAmount(amount: string, currency = 'GBP'): string {
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) return amount;
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return amount;
  }
}

export function getBadgeClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes('paid') || normalized.includes('deposited')) {
    return 'bg-[#DCFCE7] text-[#16A34A]';
  }
  if (normalized.includes('overdue') || normalized.includes('unpaid')) {
    return 'bg-[#FFEDD5] text-[#EA580C]';
  }
  if (normalized.includes('partial')) {
    return 'bg-[#F3E8FF] text-[#9333EA]';
  }
  if (normalized.includes('void') || normalized.includes('draft')) {
    return 'bg-[#E4E4E7] text-[#71717A]';
  }
  if (normalized.includes('failed') || normalized.includes('disputed')) {
    return 'bg-[#FEE2E2] text-[#DC2626]';
  }
  return 'bg-[#F3F4F6] text-[#374151]';
}

export function formatPaymentMethodLabel(method?: string | null): string {
  if (!method?.trim()) return '-';
  return method
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
