import { format, parseISO } from 'date-fns';
import type { CreditActivityItemDto } from '@/store/api/creditOverviewApi';

export type CreditUiSeverity = 'Info' | 'Notice' | 'Normal' | 'Warning' | 'Critical';

export type CreditActivityUserType = 'Admin' | 'Client' | 'System' | 'Unknown';

export interface CreditActivityTableRow {
  id: string;
  rawEventType: string;
  /** Display title for event column */
  eventType: string;
  description: string;
  /** Admin | Client | System | Unknown — matches badge map keys */
  userType: CreditActivityUserType;
  timestampDisplay: string;
  severity: CreditUiSeverity;
  actedBy: string;
  auditRefDisplay: string;
  ipAddress: string;
  browser: string;
  device: string;
  os: string;
}

export function mapApiSeverityToUi(severity: string | null | undefined): CreditUiSeverity {
  const normalized = severity?.trim().toUpperCase() ?? '';
  if (normalized === 'NOTICE') return 'Notice';
  if (normalized === 'WARNING') return 'Warning';
  if (normalized === 'CRITICAL') return 'Critical';
  if (normalized === 'INFO') return 'Info';
  return 'Normal';
}

const DEVICE_NORMALIZE: Record<string, CreditActivityTableRow['device']> = {
  desktop: 'Desktop',
  laptop: 'Laptop',
  mobile: 'Mobile',
  tablet: 'Mobile',
};

function normalizeDeviceLabel(device: string | null | undefined): CreditActivityTableRow['device'] {
  if (!device) return 'Desktop';
  const key = device.trim().toLowerCase();
  return DEVICE_NORMALIZE[key] ?? 'Desktop';
}

function normalizeUserType(apiType: string | null | undefined): CreditActivityUserType {
  const t = apiType?.trim() ?? '';
  if (t === 'Admin') return 'Admin';
  if (t === 'System') return 'System';
  if (t === 'Client') return 'Client';
  return 'Unknown';
}

export const SEVERITY_BADGE_CLASS_EXTENDED: Record<CreditUiSeverity, string> = {
  Info: 'bg-blue-100 text-blue-700 border-blue-200',
  Notice: 'bg-slate-100 text-slate-700 border-slate-200',
  Warning: 'bg-amber-100 text-amber-700 border-amber-200',
  Normal: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
  Critical: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]',
};

export const USER_TYPE_BADGE_CLASS_EXTENDED: Record<CreditActivityUserType, string> = {
  Admin: 'bg-[#E6F4EA] text-[#1E4620] border-[#BBF7D0]',
  Client: 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]',
  System: 'bg-[#F4F4F5] text-[#3F3F46] border-[#E4E4E7]',
  Unknown: 'bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7]',
};

/** Format timestamps from API ISO to short display; falls back if parse fails */
export function formatCreditActivityTimestamp(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'dd/MM/yy, HH:mm:ss.SSS');
  } catch {
    try {
      return format(new Date(iso), 'dd/MM/yy, HH:mm:ss.SSS');
    } catch {
      return iso;
    }
  }
}

function formatCreditActivityEventTitle(raw: string | null | undefined): string {
  if (!raw?.trim()) return 'Event';
  return raw
    .trim()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export function mapCreditActivityItemToRow(item: CreditActivityItemDto): CreditActivityTableRow {
  const displayEvent =
    item.event_label?.trim() || formatCreditActivityEventTitle(item.event_type) || 'Event';
  const rawEventType = item.event_type?.trim() || item.event_label?.trim() || '—';

  const actedBy =
    item.acted_by?.trim() ||
    item.acted_by_email?.trim() ||
    (item.user_type === 'System' ? '—' : '—');

  return {
    id: item.id,
    rawEventType,
    eventType: displayEvent,
    description: typeof item.description === 'string' ? item.description.trim() || '—' : '—',
    userType: normalizeUserType(typeof item.user_type === 'string' ? item.user_type : null),
    timestampDisplay: formatCreditActivityTimestamp(
      typeof item.timestamp === 'string' ? item.timestamp : null
    ),
    severity: mapApiSeverityToUi(typeof item.severity === 'string' ? item.severity : null),
    actedBy,
    auditRefDisplay: item.audit_ref?.trim() || '—',
    ipAddress: item.ip_address?.trim() || '—',
    browser: item.browser?.trim() || '—',
    device: normalizeDeviceLabel(item.device),
    os: item.os?.trim() || '—',
  };
}

export function formatOverviewMoneyPounds(amount?: string | number | null): string | null {
  if (amount === null || amount === undefined) return null;
  const n = typeof amount === 'number' ? amount : Number(String(amount).replaceAll(',', ''));
  if (!Number.isFinite(n)) return null;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function overviewDateMedium(iso?: string | null): string | null {
  if (!iso) return null;
  try {
    return format(parseISO(iso), 'dd MMM yyyy');
  } catch {
    try {
      return format(new Date(iso), 'dd MMM yyyy');
    } catch {
      return null;
    }
  }
}

export function capitalizeWords(value: string): string {
  const lower = value.trim().toLowerCase();
  return lower.replaceAll(/\b\w/g, (c) => c.toUpperCase());
}

export function mapUiGranularity(selected: string): 'weekly' | 'monthly' | 'yearly' {
  const p = selected.trim().toLowerCase();
  if (p === 'weekly') return 'weekly';
  if (p === 'yearly') return 'yearly';
  return 'monthly';
}

/** Build bar chart-friendly label from backend period buckets */
export function formatTrendTickLabel(period: string, granularity: string): string {
  if (!period) return '';
  const gran = granularity.toLowerCase();
  if (gran === 'yearly') return period.slice(0, 4);

  const monthMatch = /^(\d{4})-(\d{2})/.exec(period);
  if (monthMatch) {
    const y = Number(monthMatch[1]);
    const m = Number(monthMatch[2]);
    if (!Number.isNaN(y) && !Number.isNaN(m) && m >= 1 && m <= 12) {
      try {
        return format(new Date(Date.UTC(y, m - 1, 1)), gran === 'weekly' ? 'MMM' : 'MMM');
      } catch {
        return period;
      }
    }
  }

  return period.slice(5); // fallback: drop year prefix like 2026-W05
}

export function coerceNumber(amount?: string | number | null): number | null {
  if (amount == null || amount === '') return null;
  const n = Number(String(amount).replaceAll(',', ''));
  return Number.isFinite(n) ? n : null;
}
