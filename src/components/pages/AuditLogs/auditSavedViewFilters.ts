/** Backend stores arbitrary JSON; we persist our shape under this key inside `filters`. */
export const AUDIT_ACTIVITY_SAVED_FILTERS_KEY = 'activity_log_v1';

export const MAX_SAVED_AUDIT_VIEWS = 5;

export interface AuditActivitySavedSnapshot {
  categories: string[];
  severities: string[];
  actors: string[];
  eventTypes: string[];
  sortBy: 'asc' | 'desc';
  search: string;
  fromIso: string | null;
  toIso: string | null;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string');
}

function parseV1Payload(o: Record<string, unknown>): AuditActivitySavedSnapshot {
  return {
    categories: asStringArray(o.categories),
    severities: asStringArray(o.severities),
    actors: asStringArray(o.actors),
    eventTypes: asStringArray(o.eventTypes),
    sortBy: o.sortBy === 'asc' ? 'asc' : 'desc',
    search: typeof o.search === 'string' ? o.search : '',
    fromIso: typeof o.fromIso === 'string' ? o.fromIso : null,
    toIso: typeof o.toIso === 'string' ? o.toIso : null,
  };
}

/** Fallback if API stores the same fields as GET `/audit-logs` query params */
function parseNativeAuditFilters(f: Record<string, unknown>): AuditActivitySavedSnapshot {
  let actors: string[] = [];
  if (typeof f.actor === 'string' && (f.actor === 'Admin' || f.actor === 'Client')) {
    actors = [f.actor];
  } else {
    actors = asStringArray(f.actor);
  }
  return {
    categories: asStringArray(f.category),
    severities: asStringArray(f.severity),
    actors,
    eventTypes: asStringArray(f.event_type),
    sortBy: f.sort_by === 'asc' ? 'asc' : 'desc',
    search: typeof f.search === 'string' ? f.search : '',
    fromIso: typeof f.from_date === 'string' ? f.from_date : null,
    toIso: typeof f.to_date === 'string' ? f.to_date : null,
  };
}

export function snapshotToSavedViewFiltersPayload(
  snapshot: AuditActivitySavedSnapshot
): Record<string, unknown> {
  return {
    [AUDIT_ACTIVITY_SAVED_FILTERS_KEY]: {
      categories: snapshot.categories,
      severities: snapshot.severities,
      actors: snapshot.actors,
      eventTypes: snapshot.eventTypes,
      sortBy: snapshot.sortBy,
      search: snapshot.search,
      fromIso: snapshot.fromIso,
      toIso: snapshot.toIso,
    },
  };
}

export function savedViewFiltersToSnapshot(filters: unknown): AuditActivitySavedSnapshot {
  const empty = (): AuditActivitySavedSnapshot => ({
    categories: [],
    severities: [],
    actors: [],
    eventTypes: [],
    sortBy: 'desc',
    search: '',
    fromIso: null,
    toIso: null,
  });

  if (!filters || typeof filters !== 'object' || Array.isArray(filters)) return empty();
  const f = filters as Record<string, unknown>;

  const v1 = f[AUDIT_ACTIVITY_SAVED_FILTERS_KEY];
  if (v1 && typeof v1 === 'object' && !Array.isArray(v1)) {
    return parseV1Payload(v1 as Record<string, unknown>);
  }

  return parseNativeAuditFilters(f);
}
