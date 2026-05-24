import { format, parseISO } from 'date-fns';
import type {
  CreditApplicationDetail,
  CreditTradeReferenceDetail,
} from '@/store/api/creditApplicationsApi';
import {
  coerceNumber,
  formatOverviewMoneyPounds,
  overviewDateMedium,
} from '@/lib/creditPresentation';

export const CREDIT_APPLICATION_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  REVIEWER_ASSIGNED: 'Reviewer Assigned',
  REFERENCES_VERIFIED: 'References Verified',
  CREDIT_CHECK_COMPLETED: 'Credit Check Completed',
  CREDIT_CHECK_FAILED: 'Credit Check Failed',
  CREDIT_CHECK_INVESTIGATION_PROGRESS: 'Credit Check Investigation in Progress',
  READY_FOR_DECISION: 'Ready for Decision',
  APPROVED: 'Approved',
  REJECTED: 'Application Rejected',
  WITHDRAWN: 'Withdrawn',
  CANCELLED: 'Cancelled',
};

export function formatCreditEnumLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export function creditApplicationStatusBadgeClass(statusRaw: string | null | undefined): string {
  const status = (statusRaw ?? '').toUpperCase();
  if (status === 'APPROVED') return 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]';
  if (status === 'REJECTED' || status === 'CANCELLED')
    return 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]';
  if (status === 'REFERENCES_VERIFIED' || status === 'READY_FOR_DECISION')
    return 'bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]';
  if (status === 'WITHDRAWN') return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
  return 'bg-[#F4F4F5] text-[#3F3F46] border-[#E4E4E7]';
}

export function formatCreditApplicationStatus(status: string | null | undefined): string {
  const key = (status ?? '').toUpperCase();
  return CREDIT_APPLICATION_STATUS_LABELS[key] ?? formatCreditEnumLabel(status);
}

const REJECTION_CATEGORY_LABELS: Record<string, string> = {
  POOR_FINANCIAL_STANDING: 'Poor Financial Standing',
  INSUFFICIENT_TRADING_HISTORY: 'Insufficient Trading History',
  FAILED_CREDIT_CHECK: 'Failed Credit Check',
  INCOMPLETE_APPLICATION: 'Incomplete Application',
  REFERENCE_ISSUES: 'Reference Issues',
  OTHER: 'Other',
};

export function formatRejectionCategory(value: string | null | undefined): string {
  if (!value) return '—';
  const key = value.trim().toUpperCase();
  return REJECTION_CATEGORY_LABELS[key] ?? formatCreditEnumLabel(value);
}

/** Figma Applications History status pills */
export const CREDIT_APPLICATION_HISTORY_STATUS_LABELS: Record<string, string> = {
  APPROVED: 'Application Approved',
  REJECTED: 'Application Rejected',
  CANCELLED: 'Application Cancelled',
  WITHDRAWN: 'Application Withdrawn',
};

export function formatApplicationHistoryStatus(status: string | null | undefined): string {
  const key = (status ?? '').toUpperCase();
  return CREDIT_APPLICATION_HISTORY_STATUS_LABELS[key] ?? formatCreditApplicationStatus(status);
}

export function applicationHistoryStatusBadgeClass(statusRaw: string | null | undefined): string {
  const status = (statusRaw ?? '').toUpperCase();
  if (status === 'APPROVED') return 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]';
  if (status === 'REJECTED') return 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]';
  if (status === 'CANCELLED' || status === 'WITHDRAWN')
    return 'bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7]';
  return 'bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]';
}

export function applicationHistoryStatusDotClass(statusRaw: string | null | undefined): string {
  const status = (statusRaw ?? '').toUpperCase();
  if (status === 'APPROVED') return 'bg-[#22C55E]';
  if (status === 'REJECTED') return 'bg-[#EF4444]';
  if (status === 'CANCELLED' || status === 'WITHDRAWN') return 'bg-[#71717A]';
  return 'bg-[#6366F1]';
}

export function formatCreditDetailDate(iso?: string | null): string {
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

export function formatCreditDetailDateTime(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'dd MMM yyyy - h:mm a');
  } catch {
    try {
      return format(new Date(iso), 'dd MMM yyyy - h:mm a');
    } catch {
      return iso;
    }
  }
}

export function formatPaymentTermsLabel(days: number | null | undefined): string {
  if (days == null || !Number.isFinite(days)) return '—';
  return `Net ${days}`;
}

export function formatRelationshipDuration(value: string | null | undefined): string {
  if (!value) return '—';
  const map: Record<string, string> = {
    LESS_THAN_1_YEAR: 'Less than 1 year',
    '1_TO_2_YEARS': '1-2 years',
    '2_TO_5_YEARS': '2-5 years',
    '5_TO_10_YEARS': '5-10 years',
    OVER_10_YEARS: 'Over 10 years',
  };
  return map[value] ?? formatCreditEnumLabel(value);
}

export function formatBankAccountType(value: string | null | undefined): string {
  if (!value) return '—';
  const map: Record<string, string> = {
    BUSINESS_CURRENT: 'Business Current',
    BUSINESS_SAVINGS: 'Business Savings',
    OTHER: 'Other',
  };
  return map[value] ?? formatCreditEnumLabel(value);
}

export function formatVerificationStatus(value: string | null | undefined): {
  label: string;
  className: string;
  dotClass?: string;
} {
  const key = (value ?? '').toUpperCase();
  if (key === 'VERIFIED') {
    return { label: 'Verified', className: 'bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7]' };
  }
  if (key === 'PENDING') {
    return {
      label: 'Pending',
      className: 'bg-[#FFFBEB] text-[#A16207] border-[#FDE68A]',
      dotClass: 'bg-[#EAB308]',
    };
  }
  if (key === 'REJECTED') {
    return { label: 'Rejected', className: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]' };
  }
  return {
    label: formatCreditEnumLabel(value),
    className: 'bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7]',
    dotClass: undefined,
  };
}

export function formatPersonName(
  person: { first_name?: string | null; last_name?: string | null } | null | undefined
): string {
  if (!person) return '—';
  const name = `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim();
  return name || '—';
}

export function getApplicationDisplayId(application: CreditApplicationDetail): string {
  const num = application.application_number?.trim();
  return num ? `# ${num}` : '—';
}

export function isApplicationRejected(application: CreditApplicationDetail): boolean {
  return (
    (application.status ?? '').toUpperCase() === 'REJECTED' || Boolean(application.rejected_at)
  );
}

export function getRejectionDisplay(application: CreditApplicationDetail): {
  reason: string;
  rejectedOn: string;
} | null {
  if (!isApplicationRejected(application)) return null;
  return {
    reason:
      application.rejection_reason?.trim() ||
      formatRejectionCategory(application.rejection_category) ||
      '—',
    rejectedOn: formatCreditDetailDateTime(application.rejected_at),
  };
}

export function formatMoneyField(value: string | number | null | undefined): string {
  return formatOverviewMoneyPounds(coerceNumber(value)) ?? '—';
}

export function formatSeasonalPeaks(peaks: string[] | null | undefined): string {
  if (!peaks?.length) return '—';
  return peaks.join(', ');
}

export function sortTradeReferences(
  refs: CreditTradeReferenceDetail[] | null | undefined
): CreditTradeReferenceDetail[] {
  return [...(refs ?? [])].sort((a, b) => (a.ref_index ?? 0) - (b.ref_index ?? 0));
}

export { overviewDateMedium };
