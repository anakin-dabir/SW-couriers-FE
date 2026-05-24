import { baseApi } from '@/store/api/baseApi';
import type { ApiResponse } from '@/store/api/types';

export type CreditTrendGranularity = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CreditOverviewAccount {
  id?: string | null;
  organization_id?: string | null;
  status?: string | null;
  credit_limit?: string | null;
  credit_limit_updated_at?: string | null;
  used_credit?: string | null;
  available_credit?: string | null;
  review_frequency?: string | null;
  last_status_change_at?: string | null;
  credit_facility_start_date?: string | null;
  credit_facility_end_date?: string | null;
  payment_terms_days?: number | null;
  payment_terms_updated_at?: string | null;
  payment_terms_effective_from?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Lean credit-account snapshot used on the order-creation payment step. */
export interface CreditAccountOverview {
  status: string;
  credit_limit: string;
  outstanding_balance: string;
  available_credit: string;
  credit_limit_used_percent: number;
}

export interface CreditOverviewData {
  account?: CreditOverviewAccount | null;
  utilization_percent?: number | null;
  available_credit?: string | null;
  credit_status?: { status?: string | null; last_changed_at?: string | null } | null;
  credit_limit?: { amount?: string | null; last_adjusted_at?: string | null } | null;
  credit_terms?: {
    payment_terms_days?: number | null;
    terms_label?: string | null;
  } | null;
  next_review?: { due_date?: string | null; days_remaining?: number | null } | null;
  outstanding_balance?: { as_of?: string | null; total?: string | null } | null;
  overdue?: Record<string, unknown> | null;
  next_invoice?: Record<string, unknown> | null;
  internal_credit_score?: {
    score?: number | null;
    label?: string | null;
    last_recalculated_at?: string | null;
  } | null;
  report_summary?: Record<string, unknown> | null;
  config_summary?: Record<string, unknown> | null;
  credit_facility_end_date?: string | null;
  risk_flags?: unknown[] | null;
}

export interface CreditTrendPoint {
  period: string;
  value: number;
  change?: number | null;
}

export interface CreditActivityItemDto {
  id: string;
  event_type?: string | null;
  event_label?: string | null;
  description?: string | null;
  user_type?: string | null;
  severity?: string | null;
  timestamp?: string | null;
  audit_ref?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  ip_address?: string | null;
  browser?: string | null;
  device?: string | null;
  os?: string | null;
  acted_by?: string | null;
  acted_by_email?: string | null;
}

export interface CreditActivityListData {
  items: CreditActivityItemDto[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/** Curated CREDIT-ish event filters for Activity UI multi-select */
export const CREDIT_ACTIVITY_FILTER_EVENT_TYPES: readonly string[] = [
  'CREDIT_APPLICATION_SUBMITTED',
  'CREDIT_APPLICATION_ASSIGNED',
  'CREDIT_APPLICATION_APPROVED',
  'CREDIT_APPLICATION_REJECTED',
  'CREDIT_SCORE_RECALCULATED',
  'CREDIT_SCORE_BAND_CHANGED',
  'CREDIT_LIMIT_ADJUSTED',
  'CREDIT_TERMS_MODIFIED',
  'CREDIT_HOLD_TRIGGERED',
  'CREDIT_HOLD_REINSTATED',
  'CREDIT_SUSPENDED',
  'CREDIT_SUSPENSION_REINSTATED',
  'CREDIT_REVIEW_COMPLETED',
  'CREDIT_REVIEW_OVERDUE',
  'CREDIT_EXTENSION_GRANTED',
  'CREDIT_EXTENSION_REJECTED',
  'CREDIT_EXTENSION_REVERTED',
  'CREDIT_STATUS_CHANGED',
  'CREDIT_ALERT_TRIGGERED',
  'CREDIT_ALERT_ACKNOWLEDGED',
  'CREDIT_ALERT_SNOOZED',
  'CREDIT_ALERT_RESOLVED',
  'CREDIT_CONSUMED',
  'CREDIT_REPAID',
  'CREDIT_MANUALLY_ADJUSTED',
  'CREDIT_LIMIT_INCREASE_REQUESTED',
  'CREDIT_LIMIT_INCREASE_APPROVED',
  'CREDIT_LIMIT_INCREASE_REJECTED',
  'CREDIT_LIMIT_UPDATED',
  'REMINDER_SENT',
];

export interface GetCreditTrendArgs {
  organizationId: string;
  year: number;
  /** When granularity is daily, backend requires month */
  month?: number | null;
  granularity?: CreditTrendGranularity;
}

export interface GetCreditActivityArgs {
  organizationId: string;
  page?: number;
  size?: number;
  search?: string | null;
  event_type?: string[];
  user_type?: string[];
  severity?: string[];
  from_date?: string | null;
  to_date?: string | null;
}

export interface ListCreditLimitIncreaseRequestsArgs {
  organizationId: string;
  page?: number;
  size?: number;
}

export interface CreditLimitIncreaseUserRef {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

export interface CreditLimitIncreaseRequestItem {
  id: string;
  previous_limit: string | null;
  requested_limit: string | null;
  approved_limit: string | null;
  reason: string | null;
  status: string;
  requested_by: CreditLimitIncreaseUserRef | null;
  reviewed_by: CreditLimitIncreaseUserRef | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface CreditLimitIncreaseRequestListData {
  items: CreditLimitIncreaseRequestItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
  current_url?: string | null;
  next_url?: string | null;
}

/** @deprecated Use CreditLimitIncreaseRequestItem */
export type CreditLimitIncreaseRequestDetailDto = CreditLimitIncreaseRequestItem;

export interface CreateCreditLimitIncreaseRequestBody {
  requested_credit_limit: number;
  reason: string;
}

function assertObject(raw: unknown, message: string): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') throw new Error(message);
  return raw as Record<string, unknown>;
}

function assertBool(value: unknown, message: string): boolean {
  if (typeof value !== 'boolean') throw new Error(message);
  return value;
}

function assertString(value: unknown, message: string): string {
  if (typeof value !== 'string' || value.length === 0) throw new Error(message);
  return value;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function parseLimitIncreaseUserRef(raw: unknown): CreditLimitIncreaseUserRef | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const id = typeof row.id === 'string' ? row.id : null;
  if (!id) return null;
  return {
    id,
    first_name: asNullableString(row.first_name),
    last_name: asNullableString(row.last_name),
  };
}

function parseLimitIncreaseRequestItem(
  raw: unknown,
  message: string,
  index: number
): CreditLimitIncreaseRequestItem {
  const row = assertObject(raw, `${message}: items[${index}]`);
  return {
    id: assertString(row.id, `${message}: items[${index}].id`),
    previous_limit: asNullableString(row.previous_limit),
    requested_limit: asNullableString(row.requested_limit),
    approved_limit: asNullableString(row.approved_limit),
    reason: asNullableString(row.reason),
    status: assertString(row.status, `${message}: items[${index}].status`),
    requested_by: parseLimitIncreaseUserRef(row.requested_by),
    reviewed_by: parseLimitIncreaseUserRef(row.reviewed_by),
    reviewed_at: asNullableString(row.reviewed_at),
    created_at: assertString(row.created_at, `${message}: items[${index}].created_at`),
  };
}

function parseLimitIncreaseRequestList(
  inner: unknown,
  message: string
): CreditLimitIncreaseRequestListData {
  if (!inner || typeof inner !== 'object') {
    return { items: [], total: 0, page: 1, size: 20, pages: 0 };
  }
  const wrap = inner as Record<string, unknown>;
  const itemsRaw = Array.isArray(wrap.items) ? wrap.items : [];
  const items = itemsRaw.map((entry, index) =>
    parseLimitIncreaseRequestItem(entry, message, index)
  );
  const total =
    typeof wrap.total === 'number' ? wrap.total : Number(wrap.total) > 0 ? Number(wrap.total) : 0;
  const page =
    typeof wrap.page === 'number' ? wrap.page : Number(wrap.page) > 0 ? Number(wrap.page) : 1;
  const size =
    typeof wrap.size === 'number' ? wrap.size : Number(wrap.size) > 0 ? Number(wrap.size) : 20;
  const pages =
    typeof wrap.pages === 'number' ? wrap.pages : Number(wrap.pages) >= 0 ? Number(wrap.pages) : 0;
  return {
    items,
    total,
    page,
    size,
    pages,
    current_url: asNullableString(wrap.current_url),
    next_url: asNullableString(wrap.next_url),
  };
}

export function unwrapApiData<T>(
  raw: unknown,
  message: string
): { ok: false; reason: string } | { ok: true; value: ApiResponse<T> } {
  const obj = assertObject(raw, `${message}: response is not an object`);
  if (!('success' in obj) || typeof obj.success !== 'boolean') {
    return { ok: false, reason: `${message}: success missing or invalid` };
  }
  if (!assertBool(obj.success, `${message}: success invalid`)) {
    return { ok: false, reason: `${message}: success is false` };
  }
  if (!('data' in obj)) {
    return { ok: false, reason: `${message}: missing data` };
  }
  return { ok: true, value: obj as unknown as ApiResponse<T> };
}

function parseTrendArray(raw: unknown, message: string): CreditTrendPoint[] {
  const unwrapped = unwrapApiData<unknown>(raw, message);
  if (!unwrapped.ok) return [];
  if (!Array.isArray(unwrapped.value.data)) return [];
  return unwrapped.value.data.map((entry, index) => {
    const row = assertObject(entry, `${message}: data[${index}]`);
    const period = typeof row.period === 'string' ? row.period : '';
    const value = typeof row.value === 'number' ? row.value : Number(row.value);
    const changeRaw = row.change;
    const change =
      typeof changeRaw === 'number'
        ? changeRaw
        : typeof changeRaw === 'string' && changeRaw.length > 0
          ? Number(changeRaw)
          : null;
    return {
      period,
      value: Number.isFinite(value) ? value : 0,
      change: Number.isFinite(change ?? NaN) ? change : null,
    };
  });
}

export function parseCreditTrendResponse(raw: unknown, message: string): CreditTrendPoint[] {
  return parseTrendArray(raw, message);
}

function parseOverviewData(inner: unknown): CreditOverviewData {
  const data = inner && typeof inner === 'object' ? (inner as Record<string, unknown>) : {};
  return data as CreditOverviewData;
}

function parseActivityList(inner: unknown, message: string): CreditActivityListData {
  if (!inner || typeof inner !== 'object') {
    return { items: [], total: 0, page: 1, size: 20, pages: 0 };
  }
  const wrap = inner as Record<string, unknown>;
  const itemsRaw = Array.isArray(wrap.items) ? wrap.items : [];
  const items: CreditActivityItemDto[] = itemsRaw.map((entry, index) => {
    const row = assertObject(entry, `${message}: items[${index}]`);
    return {
      id: typeof row.id === 'string' ? row.id : String(index),
      event_type: typeof row.event_type === 'string' ? row.event_type : null,
      event_label: typeof row.event_label === 'string' ? row.event_label : null,
      description: typeof row.description === 'string' ? row.description : null,
      user_type: typeof row.user_type === 'string' ? row.user_type : null,
      severity: typeof row.severity === 'string' ? row.severity : null,
      timestamp: typeof row.timestamp === 'string' ? row.timestamp : null,
      audit_ref: typeof row.audit_ref === 'string' ? row.audit_ref : null,
      entity_type: typeof row.entity_type === 'string' ? row.entity_type : null,
      entity_id: typeof row.entity_id === 'string' ? row.entity_id : null,
      ip_address: typeof row.ip_address === 'string' ? row.ip_address : null,
      browser: typeof row.browser === 'string' ? row.browser : null,
      device: typeof row.device === 'string' ? row.device : null,
      os: typeof row.os === 'string' ? row.os : null,
      acted_by: typeof row.acted_by === 'string' ? row.acted_by : null,
      acted_by_email: typeof row.acted_by_email === 'string' ? row.acted_by_email : null,
    };
  });
  const total =
    typeof wrap.total === 'number' ? wrap.total : Number(wrap.total) > 0 ? Number(wrap.total) : 0;
  const page =
    typeof wrap.page === 'number' ? wrap.page : Number(wrap.page) > 0 ? Number(wrap.page) : 1;
  const size =
    typeof wrap.size === 'number' ? wrap.size : Number(wrap.size) > 0 ? Number(wrap.size) : 20;
  const pages =
    typeof wrap.pages === 'number' ? wrap.pages : Number(wrap.pages) >= 0 ? Number(wrap.pages) : 0;
  return { items, total, page, size, pages };
}

export const creditOverviewApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCreditOverview: build.query<ApiResponse<CreditOverviewData>, { organizationId: string }>({
      query: ({ organizationId }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/overview`,
        method: 'GET',
      }),
      transformResponse(raw: unknown) {
        const unwrapped = unwrapApiData<CreditOverviewData>(raw, 'Credit overview response');
        if (!unwrapped.ok) {
          throw new Error(unwrapped.reason);
        }
        return {
          ...unwrapped.value,
          data: parseOverviewData(unwrapped.value.data),
        };
      },
      providesTags: (_r, _e, { organizationId }) => [
        { type: 'CreditOverview', id: organizationId },
      ],
    }),
    getCreditAccountOverview: build.query<
      ApiResponse<CreditAccountOverview>,
      { organizationId: string }
    >({
      query: ({ organizationId }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/account-overview`,
        method: 'GET',
      }),
      transformResponse(raw: unknown) {
        const unwrapped = unwrapApiData<CreditAccountOverview>(
          raw,
          'Credit account overview response'
        );
        if (!unwrapped.ok) {
          throw new Error(unwrapped.reason);
        }
        return unwrapped.value;
      },
      providesTags: (_r, _e, { organizationId }) => [
        { type: 'CreditOverview', id: organizationId },
      ],
    }),
    getCreditLimitTrend: build.query<CreditTrendPoint[], GetCreditTrendArgs>({
      query: ({ organizationId, year, month, granularity = 'monthly' }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/overview/limit-trend`,
        method: 'GET',
        params: {
          year,
          month: month ?? undefined,
          granularity,
        },
      }),
      transformResponse: (raw) => parseCreditTrendResponse(raw, 'Credit limit trend'),
      providesTags: (_r, _e, arg) => [
        {
          type: 'CreditLimitTrend',
          id: `${arg.organizationId}-${arg.year}-${arg.granularity ?? 'monthly'}-${arg.month ?? 'all'}`,
        },
      ],
    }),
    getCreditUtilisationTrend: build.query<CreditTrendPoint[], GetCreditTrendArgs>({
      query: ({ organizationId, year, month, granularity = 'monthly' }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/overview/utilisation-trend`,
        method: 'GET',
        params: {
          year,
          month: month ?? undefined,
          granularity,
        },
      }),
      transformResponse: (raw) => parseCreditTrendResponse(raw, 'Credit utilisation trend'),
      providesTags: (_r, _e, arg) => [
        {
          type: 'CreditUtilisationTrend',
          id: `${arg.organizationId}-${arg.year}-${arg.granularity ?? 'monthly'}-${arg.month ?? 'all'}`,
        },
      ],
    }),
    getCreditActivity: build.query<ApiResponse<CreditActivityListData>, GetCreditActivityArgs>({
      query: ({
        organizationId,
        page = 1,
        size = 20,
        search,
        event_type,
        user_type,
        severity,
        from_date,
        to_date,
      }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/activity`,
        method: 'GET',
        params: {
          page,
          size,
          search: search ?? undefined,
          event_type: Array.isArray(event_type) && event_type.length > 0 ? event_type : undefined,
          user_type: Array.isArray(user_type) && user_type.length > 0 ? user_type : undefined,
          severity: Array.isArray(severity) && severity.length > 0 ? severity : undefined,
          from_date: from_date ?? undefined,
          to_date: to_date ?? undefined,
        },
      }),
      transformResponse(raw: unknown) {
        const unwrapped = unwrapApiData<CreditActivityListData>(raw, 'Credit activity');
        if (!unwrapped.ok) {
          throw new Error(unwrapped.reason);
        }
        return {
          ...unwrapped.value,
          data: parseActivityList(unwrapped.value.data, 'Credit activity'),
        };
      },
      providesTags: (_r, _e, arg) => [
        { type: 'CreditActivity', id: `${arg.organizationId}-${arg.page}-${arg.size}` },
      ],
    }),
    listCreditLimitIncreaseRequests: build.query<
      ApiResponse<CreditLimitIncreaseRequestListData>,
      ListCreditLimitIncreaseRequestsArgs
    >({
      query: ({ organizationId, page = 1, size = 20 }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/limit-increase-requests`,
        method: 'GET',
        params: { page, size },
      }),
      transformResponse(raw: unknown) {
        const unwrapped = unwrapApiData<CreditLimitIncreaseRequestListData>(
          raw,
          'Credit limit increase requests'
        );
        if (!unwrapped.ok) throw new Error(unwrapped.reason);
        return {
          ...unwrapped.value,
          data: parseLimitIncreaseRequestList(
            unwrapped.value.data,
            'Credit limit increase requests'
          ),
        };
      },
      providesTags: (_r, _e, { organizationId }) => [
        { type: 'CreditLimitIncreaseRequests', id: organizationId },
      ],
    }),
    getCreditLimitIncreaseRequestById: build.query<
      ApiResponse<CreditLimitIncreaseRequestItem>,
      { organizationId: string; requestId: string }
    >({
      query: ({ organizationId, requestId }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/limit-increase-requests/${encodeURIComponent(requestId)}`,
        method: 'GET',
      }),
      transformResponse(raw: unknown) {
        const unwrapped = unwrapApiData<CreditLimitIncreaseRequestItem>(
          raw,
          'Credit limit increase request detail'
        );
        if (!unwrapped.ok) throw new Error(unwrapped.reason);
        return {
          ...unwrapped.value,
          data: parseLimitIncreaseRequestItem(
            unwrapped.value.data,
            'Credit limit increase request detail',
            0
          ),
        };
      },
      providesTags: (_r, _e, arg) => [
        { type: 'CreditLimitIncreaseRequestDetail', id: arg.requestId },
      ],
    }),
    createCreditLimitIncreaseRequest: build.mutation<
      ApiResponse<unknown>,
      { organizationId: string } & CreateCreditLimitIncreaseRequestBody
    >({
      query: ({ organizationId, ...body }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/limit-increase-requests`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'CreditLimitIncreaseRequests', id: arg.organizationId },
        { type: 'CreditOverview', id: arg.organizationId },
        { type: 'CreditLimitTrend' },
        { type: 'CreditUtilisationTrend' },
      ],
    }),
  }),
});

export const {
  useGetCreditOverviewQuery,
  useGetCreditAccountOverviewQuery,
  useGetCreditLimitTrendQuery,
  useGetCreditUtilisationTrendQuery,
  useGetCreditActivityQuery,
  useListCreditLimitIncreaseRequestsQuery,
  useGetCreditLimitIncreaseRequestByIdQuery,
  useCreateCreditLimitIncreaseRequestMutation,
} = creditOverviewApi;
