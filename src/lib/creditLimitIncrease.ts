import { format, parseISO } from 'date-fns';
import type { CreditLimitIncreaseRequestItem } from '@/store/api/creditOverviewApi';
import { coerceNumber, formatOverviewMoneyPounds } from '@/lib/creditPresentation';
import { formatCreditEnumLabel, formatPersonName } from '@/lib/creditApplicationDetail';

export function formatLimitIncreaseReference(id: string): string {
  const trimmed = id.trim();
  if (!trimmed) return '—';
  return `#${trimmed.slice(0, 8).toUpperCase()}`;
}

export function formatLimitIncreaseStatus(status: string | null | undefined): string {
  if (!status) return '—';
  const key = status.toUpperCase();
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
  };
  return labels[key] ?? formatCreditEnumLabel(status);
}

export function limitIncreaseStatusBadgeClass(status: string | null | undefined): string {
  const key = (status ?? '').toUpperCase();
  if (key === 'APPROVED') return 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]';
  if (key === 'REJECTED' || key === 'CANCELLED')
    return 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]';
  if (key === 'PENDING') return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
  return 'bg-[#F4F4F5] text-[#3F3F46] border-[#E4E4E7]';
}

export function formatLimitIncreaseMoney(value: string | null | undefined): string {
  return formatOverviewMoneyPounds(coerceNumber(value)) ?? '—';
}

export function formatLimitIncreaseCreatedAt(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'dd MMM yyyy, HH:mm');
  } catch {
    try {
      return format(new Date(iso), 'dd MMM yyyy, HH:mm');
    } catch {
      return iso;
    }
  }
}

export function formatLimitIncreaseRequestedBy(item: CreditLimitIncreaseRequestItem): string {
  return formatPersonName(item.requested_by);
}

export function formatLimitIncreaseReviewedBy(item: CreditLimitIncreaseRequestItem): string {
  return formatPersonName(item.reviewed_by);
}

export function formatLimitIncreaseHistoryDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'dd MMM yyyy');
  } catch {
    try {
      return format(new Date(iso), 'dd MMM yyyy');
    } catch {
      return iso;
    }
  }
}
