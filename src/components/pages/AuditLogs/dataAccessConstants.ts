import type { AuditLogItemDto } from '@/store/api/auditLogsApi';

/** `event_type` values sent to `GET .../audit-logs/data-access` for category chips */
export const DATA_ACCESS_EVENT_TYPE_FILTERS = [
  'FINANCIAL_DATA_ACCESSED',
  'CREDIT_DATA_ACCESSED',
  'CLIENT_PROFILE_VIEWED',
  'ORDER_DATA_ACCESSED',
  'CONTACT_DATA_ACCESSED',
  'AUDIT_LOG_ACCESSED',
] as const;

export type DataAccessEventTypeFilter = (typeof DATA_ACCESS_EVENT_TYPE_FILTERS)[number];

export const DATA_ACCESS_ACTOR_OPTIONS = ['Admin', 'Client'] as const;

const EVENT_TYPE_LABELS: Record<string, string> = {
  FINANCIAL_DATA_ACCESSED: 'Financial Data Access',
  CREDIT_DATA_ACCESSED: 'Credit Data Access',
  CLIENT_PROFILE_VIEWED: 'Profile Access',
  ORDER_DATA_ACCESSED: 'Order Data Access',
  CONTACT_DATA_ACCESSED: 'Contact Data Access',
  AUDIT_LOG_ACCESSED: 'Audit Log Access',
};

const EVENT_TYPE_PILL_COLORS: Record<string, string> = {
  FINANCIAL_DATA_ACCESSED: 'bg-[#475569]',
  CREDIT_DATA_ACCESSED: 'bg-[#0891B2]',
  CLIENT_PROFILE_VIEWED: 'bg-[#059669]',
  ORDER_DATA_ACCESSED: 'bg-[#EA580C]',
  CONTACT_DATA_ACCESSED: 'bg-[#2563EB]',
  AUDIT_LOG_ACCESSED: 'bg-black',
};

export function dataAccessEventTypeLabel(code: string): string {
  return EVENT_TYPE_LABELS[code] ?? code;
}

export function dataAccessCategoryPillClass(row: AuditLogItemDto): string {
  const code = row.event_type?.trim() ?? '';
  return EVENT_TYPE_PILL_COLORS[code] ?? 'bg-[#475569]';
}

/** Highlight row when backend marks elevated severity or explicit unusual pattern */
export function isDataAccessUnusualRow(row: AuditLogItemDto): boolean {
  const et = (row.event_type || '').toUpperCase();
  if (et === 'UNUSUAL_ACCESS_PATTERN') return true;
  const sev = (row.severity || '').toUpperCase();
  return sev === 'WARNING' || sev === 'CRITICAL';
}

export function narrowedDataAccessEventTypes(selected: string[]): string[] | undefined {
  const allowed = new Set<string>(DATA_ACCESS_EVENT_TYPE_FILTERS);
  const next = selected.filter((x) => allowed.has(x));
  return next.length > 0 ? next : undefined;
}

/**
 * Maps API `duration` strings to minutes for client-side range checks.
 * Examples: `"< 1 min"` → 0, `"3 min"` → 3. Unknown / empty → null (excluded when filtering).
 */
export function parseDataAccessDurationToMinutes(raw: string | undefined | null): number | null {
  if (raw == null || typeof raw !== 'string') return null;
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/\u2013|\u2014/g, '-');
  if (s === '' || s === '—' || s === '-') return null;

  if (s.includes('<') && s.includes('min')) return 0;

  const minMatch = s.match(/([\d.]+)\s*mins?\b/);
  if (minMatch) {
    const v = Number.parseFloat(minMatch[1]);
    return Number.isFinite(v) ? v : null;
  }

  const hrMatch = s.match(/([\d.]+)\s*h(?:rs|ours?)?\b/);
  if (hrMatch) {
    const v = Number.parseFloat(hrMatch[1]);
    return Number.isFinite(v) ? v * 60 : null;
  }

  const secMatch = s.match(/([\d.]+)\s*s(?:ecs|econds?)?\b/);
  if (secMatch) {
    const v = Number.parseFloat(secMatch[1]);
    return Number.isFinite(v) ? v / 60 : null;
  }

  return null;
}

export function rowMatchesDataAccessDurationRange(
  row: AuditLogItemDto,
  minMin: number | null,
  maxMin: number | null
): boolean {
  if (minMin == null && maxMin == null) return true;
  const mins = parseDataAccessDurationToMinutes(row.duration);
  if (mins == null) return false;
  if (minMin != null && mins < minMin) return false;
  if (maxMin != null && mins > maxMin) return false;
  return true;
}
