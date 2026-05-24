import { format, parseISO, startOfDay } from 'date-fns';
import type {
  ChangeHistoryItemDto,
  FieldHistoryItemDto,
  FieldHistoryPointDto,
} from '@/store/api/auditLogsApi';

export function formatChangeHistoryTimestamp(iso: string): string {
  try {
    return format(parseISO(iso), 'dd/MM/yy, HH:mm:ss.SSS');
  } catch {
    return iso;
  }
}

export function formatFieldHistoryTableTimestamp(iso: string): string {
  try {
    return format(parseISO(iso), 'dd/MM/yy, HH:mm:ss');
  } catch {
    return iso;
  }
}

export interface NormalizedFieldDelta {
  fieldName: string;
  before: string;
  after: string;
}

function asChangeDisplay(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return '[object]';
    }
  }
  if (typeof v === 'symbol') return v.toString();
  if (typeof v === 'function') return '[function]';
  return '[unsupported]';
}

export function normalizeChangeHistoryDelta(raw: unknown): NormalizedFieldDelta | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const fieldName = asChangeDisplay(o.field_name ?? o.field ?? o.name ?? o.property ?? '').trim();
  const before = asChangeDisplay(o.before ?? o.before_value ?? o.old_value ?? o.old ?? '—');
  const after = asChangeDisplay(o.after ?? o.after_value ?? o.new_value ?? o.new ?? '—');
  const name = fieldName.length > 0 ? fieldName : 'Field';
  return { fieldName: name, before, after };
}

export type NormalizedAuditAction = 'Create' | 'Update' | 'Delete';

export function normalizeAuditAction(raw: string): NormalizedAuditAction {
  const s = raw.trim().toLowerCase();
  if (s === 'create' || s === 'created' || s === 'added') return 'Create';
  if (s === 'delete' || s === 'deleted' || s === 'removed') return 'Delete';
  return 'Update';
}

/** Start-of-day UTC ISO for compare snapshot request bodies. */
export function snapshotDateToIso(d: Date): string {
  return startOfDay(d).toISOString();
}

/** API `entity_type` slugs → short UI labels (unknown slugs use {@link humanizeEntityTypeSlug}). */
const CHANGE_HISTORY_ENTITY_TYPE_LABELS: Record<string, string> = {
  organization: 'Organization',
  org_contact: 'Organization contact',
  pickup_address: 'Pickup address',
  credit_account: 'Credit account',
  invoice: 'Invoice',
  payment: 'Payment',
  order: 'Order',
  client: 'Client',
  contact: 'Contact',
};

function humanizeEntityTypeSlug(raw: string): string {
  const s = raw.trim();
  if (s.length === 0) return raw;
  return s
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

/** Turn backend `entity_type` (often snake_case) into a readable table label. */
export function formatChangeHistoryEntityType(raw: string): string {
  const key = raw.trim().toLowerCase();
  if (key.length === 0) return raw;
  const mapped = CHANGE_HISTORY_ENTITY_TYPE_LABELS[key];
  if (mapped) return mapped;
  if (raw.includes('_')) return humanizeEntityTypeSlug(raw);
  return raw.trim();
}

export interface ChangeLogRowView {
  id: string;
  timestamp: string;
  category: string;
  entityType: string;
  entityReference: string;
  action: NormalizedAuditAction;
  email: string;
  actor: string;
  fieldsCount: number | null;
  changeSummary: string;
  fieldChanges: NormalizedFieldDelta[];
  reason: string | null;
}

export function mapChangeHistoryItemToRow(item: ChangeHistoryItemDto): ChangeLogRowView {
  const fieldChanges = (item.changes ?? [])
    .map((c) => normalizeChangeHistoryDelta(c))
    .filter((x): x is NormalizedFieldDelta => x != null);
  const n = item.fields_changed;
  const fieldsCount = typeof n === 'number' && Number.isFinite(n) ? n : fieldChanges.length || null;
  return {
    id: item.id,
    timestamp: formatChangeHistoryTimestamp(item.created_at),
    category: item.category,
    entityType: formatChangeHistoryEntityType(item.entity_type),
    entityReference: item.entity_ref,
    action: normalizeAuditAction(item.action),
    email: item.email,
    actor: item.actor,
    fieldsCount,
    changeSummary: item.summary,
    fieldChanges,
    reason: null,
  };
}

export function buildFieldHistoryChartRows(
  points: FieldHistoryPointDto[] | undefined,
  items: FieldHistoryItemDto[]
): { month: string; value: number }[] {
  if (points != null && points.length > 0) {
    const mapped = points
      .map((p, i) => {
        const iso = p.date ?? p.timestamp;
        let month = `P${i + 1}`;
        if (iso) {
          try {
            month = format(parseISO(iso), 'MMM yyyy');
          } catch {
            month = String(iso);
          }
        }
        const value = Number(p.value ?? p.amount ?? NaN);
        return { month, value };
      })
      .filter((r) => Number.isFinite(r.value));
    if (mapped.length > 0) return mapped;
  }
  const rev = [...items].reverse();
  const out: { month: string; value: number }[] = [];
  for (const it of rev) {
    const n = Number.parseFloat(String(it.after).replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(n)) continue;
    try {
      out.push({
        month: format(parseISO(it.timestamp), 'MMM yyyy'),
        value: n,
      });
    } catch {
      out.push({ month: it.timestamp, value: n });
    }
  }
  return out;
}
