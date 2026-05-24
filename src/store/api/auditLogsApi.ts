import { baseApi } from './baseApi';
import type { ApiResponse } from './types';

export interface AuditLogsSummaryDto {
  total_events_24h: number;
  total_events_prev_24h_pct: number;
  critical_events_7d: number;
  critical_events_latest: string;
  warning_events_7d: number;
  warning_events_top_category: string;
  data_access_events_7d: number;
  data_access_unique_admins: number;
  configuration_changes_7d: number;
  configuration_changes_latest: string;
  unique_actors_30d: number;
  unique_actors_count: number;
}

export interface AuditLogItemDto {
  id: string;
  created_at: string;
  os: string;
  email: string;
  actor: string;
  category: string;
  event_type: string;
  severity: string;
  audit_ref: string;
  entity_ref: string;
  browser: string;
  device: string;
  event: string;
  action_label: string;
  entity_type: string;
  entity_id: string;
  ip_address: string;
  display_category: string;
  resource: string;
  duration: string;
}

export interface AuditLogDetailDto extends AuditLogItemDto {
  action?: string | null;
  reason?: string | null;
  user_agent?: string | null;
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  user_id?: string | null;
  organization_id?: string | null;
  session_id?: string | null;
  correlation_id?: string | null;
  integrity_hash?: string | null;
  prev_hash?: string | null;
}

export interface AuditLogsListDto {
  items: AuditLogItemDto[];
  total: number;
  page: number;
  size: number;
}

export interface AuditTrendPointDto {
  date: string;
  info: number;
  notice: number;
  warning: number;
  critical: number;
}

export interface AuditTrendDto {
  points: AuditTrendPointDto[];
}

export interface GetAuditLogsQueryArgs {
  organizationId: string;
  page?: number;
  size?: number;
  category?: string[];
  event_type?: string[];
  severity?: string[];
  actor?: string | null;
  browser?: string[];
  search?: string | null;
  from_date?: string | null;
  to_date?: string | null;
  sort_by?: 'asc' | 'desc';
  ui_category?: string[];
}

/** Query args for `GET .../audit-logs/data-access` */
export interface GetDataAccessLogsQueryArgs {
  organizationId: string;
  page?: number;
  size?: number;
  event_type?: string[];
  actor?: string | null;
  search?: string | null;
  from_date?: string | null;
  to_date?: string | null;
}

/** Saved views — `filters` is backend-defined JSON; we store client snapshot under `activity_log_v1`. */
export interface AuditSavedViewDto {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
}

export interface CreateAuditSavedViewBody {
  name: string;
  filters: Record<string, unknown>;
  is_default?: boolean;
}

function compactAuditLogQueryParams(
  args: Omit<GetAuditLogsQueryArgs, 'organizationId'>
): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (args.page != null) params.page = args.page;
  if (args.size != null) params.size = args.size;
  if (args.sort_by != null) params.sort_by = args.sort_by;
  if (args.search != null && args.search.trim() !== '') params.search = args.search.trim();
  if (args.actor != null && args.actor.trim() !== '') params.actor = args.actor.trim();
  if (args.from_date != null && args.from_date !== '') params.from_date = args.from_date;
  if (args.to_date != null && args.to_date !== '') params.to_date = args.to_date;
  if (args.category != null && args.category.length > 0) params.category = args.category;
  if (args.event_type != null && args.event_type.length > 0) params.event_type = args.event_type;
  if (args.severity != null && args.severity.length > 0) params.severity = args.severity;
  if (args.browser != null && args.browser.length > 0) params.browser = args.browser;
  if (args.ui_category != null && args.ui_category.length > 0)
    params.ui_category = args.ui_category;
  return params;
}

function compactDataAccessLogQueryParams(
  args: Omit<GetDataAccessLogsQueryArgs, 'organizationId'>
): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (args.page != null) params.page = args.page;
  if (args.size != null) params.size = args.size;
  if (args.search != null && args.search.trim() !== '') params.search = args.search.trim();
  if (args.actor != null && args.actor.trim() !== '') params.actor = args.actor.trim();
  if (args.from_date != null && args.from_date !== '') params.from_date = args.from_date;
  if (args.to_date != null && args.to_date !== '') params.to_date = args.to_date;
  if (args.event_type != null && args.event_type.length > 0) params.event_type = args.event_type;
  return params;
}

/** `GET .../audit-logs/change-history` */
export interface ChangeHistoryItemDto {
  id: string;
  created_at: string;
  category: string;
  entity_type: string;
  entity_ref: string;
  action: string;
  email: string;
  actor: string;
  fields_changed: number;
  summary: string;
  /** Field-level deltas; shape may vary by backend — see {@link normalizeChangeHistoryDelta}. */
  changes: unknown[];
}

export interface ChangeHistoryListDto {
  items: ChangeHistoryItemDto[];
  total: number;
  page: number;
  size: number;
}

export interface GetChangeHistoryLogsQueryArgs {
  organizationId: string;
  page?: number;
  size?: number;
  search?: string | null;
  from_date?: string | null;
  to_date?: string | null;
  category?: string[];
  entity_type?: string[];
  action_type?: string[];
  actor?: string | null;
}

function compactChangeHistoryQueryParams(
  args: Omit<GetChangeHistoryLogsQueryArgs, 'organizationId'>
): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (args.page != null) params.page = args.page;
  if (args.size != null) params.size = args.size;
  if (args.search != null && args.search.trim() !== '') params.search = args.search.trim();
  if (args.from_date != null && args.from_date !== '') params.from_date = args.from_date;
  if (args.to_date != null && args.to_date !== '') params.to_date = args.to_date;
  if (args.category != null && args.category.length > 0) params.category = args.category;
  if (args.entity_type != null && args.entity_type.length > 0)
    params.entity_type = args.entity_type;
  if (args.action_type != null && args.action_type.length > 0)
    params.action_type = args.action_type;
  if (args.actor != null && args.actor.trim() !== '') params.actor = args.actor.trim();
  return params;
}

export interface CompareSnapshotsBody {
  snapshot_a: string;
  snapshot_b: string;
  fields: string[];
}

/** One row from `POST .../audit-logs/compare` (`data.items`). */
export interface AuditCompareRowDto {
  field: string;
  /** Snapshot A value; backend may send `"N/A"` when unknown or not applicable. */
  value_a: string;
  /** Snapshot B value; backend may send `"N/A"` when unknown or not applicable. */
  value_b: string;
  changes: number;
}

export interface AuditCompareResultDto {
  items: AuditCompareRowDto[];
}

export interface FieldHistoryItemDto {
  timestamp: string;
  before: string;
  after: string;
  actor: string;
  reason: string;
}

/** Optional time-series points for charts — backend-defined. */
export interface FieldHistoryPointDto {
  date?: string;
  timestamp?: string;
  value?: number;
  amount?: number;
}

export interface FieldHistoryDataDto {
  items: FieldHistoryItemDto[];
  points: FieldHistoryPointDto[];
}

export const auditLogsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAuditLogsSummary: build.query<ApiResponse<AuditLogsSummaryDto>, { organizationId: string }>({
      query: ({ organizationId }) => ({
        url: `/organizations/${organizationId}/audit-logs/summary`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { organizationId }) => [
        { type: 'AuditLogsSummary', id: organizationId },
      ],
    }),
    getAuditLogsTrend: build.query<ApiResponse<AuditTrendDto>, { organizationId: string }>({
      query: ({ organizationId }) => ({
        url: `/organizations/${organizationId}/audit-logs/trend`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { organizationId }) => [
        { type: 'AuditLogsTrend', id: organizationId },
      ],
    }),
    getAuditLogs: build.query<ApiResponse<AuditLogsListDto>, GetAuditLogsQueryArgs>({
      query: ({ organizationId, ...filters }) => ({
        url: `/organizations/${organizationId}/audit-logs`,
        method: 'GET',
        params: compactAuditLogQueryParams(filters),
      }),
      providesTags: (_result, _error, { organizationId }) => [
        { type: 'AuditLogsList', id: organizationId },
      ],
    }),
    getAuditLogDetail: build.query<
      ApiResponse<AuditLogDetailDto>,
      { organizationId: string; auditLogId: string }
    >({
      query: ({ organizationId, auditLogId }) => ({
        url: `/organizations/${organizationId}/audit-logs/${encodeURIComponent(auditLogId)}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { auditLogId }) => [
        { type: 'AuditLogsList', id: auditLogId },
      ],
    }),
    /** Data Access tab — list only (`AuditLogItemDto` matches API row shape). */
    getDataAccessLogs: build.query<ApiResponse<AuditLogsListDto>, GetDataAccessLogsQueryArgs>({
      query: ({ organizationId, ...filters }) => ({
        url: `/organizations/${organizationId}/audit-logs/data-access`,
        method: 'GET',
        params: compactDataAccessLogQueryParams(filters),
      }),
      providesTags: (_result, _error, { organizationId }) => [
        { type: 'DataAccessLogs', id: organizationId },
      ],
    }),
    getChangeHistoryLogs: build.query<
      ApiResponse<ChangeHistoryListDto>,
      GetChangeHistoryLogsQueryArgs
    >({
      query: ({ organizationId, ...filters }) => ({
        url: `/organizations/${organizationId}/audit-logs/change-history`,
        method: 'GET',
        params: compactChangeHistoryQueryParams(filters),
      }),
      providesTags: (_result, _error, { organizationId }) => [
        { type: 'ChangeHistoryLogs', id: organizationId },
      ],
    }),
    compareAuditSnapshots: build.mutation<
      ApiResponse<AuditCompareResultDto>,
      { organizationId: string; body: CompareSnapshotsBody }
    >({
      query: ({ organizationId, body }) => ({
        url: `/organizations/${organizationId}/audit-logs/compare`,
        method: 'POST',
        body,
      }),
    }),
    getFieldHistory: build.query<
      ApiResponse<FieldHistoryDataDto>,
      { organizationId: string; field: string }
    >({
      query: ({ organizationId, field }) => ({
        url: `/organizations/${organizationId}/audit-logs/field-history/${encodeURIComponent(field)}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { organizationId, field }) => [
        { type: 'FieldHistory', id: `${organizationId}:${field}` },
      ],
    }),
    /** Paths match `/api/v1/organizations/audit-logs/saved-views` (tenant resolved server-side). `organizationId` is only used for cache tags / skip args. */
    getAuditSavedViews: build.query<ApiResponse<AuditSavedViewDto[]>, { organizationId: string }>({
      query: () => ({
        url: '/organizations/audit-logs/saved-views',
        method: 'GET',
      }),
      providesTags: (_result, _error, { organizationId }) => [
        { type: 'AuditSavedViews', id: organizationId },
      ],
    }),
    createAuditSavedView: build.mutation<
      ApiResponse<AuditSavedViewDto>,
      { organizationId: string; body: CreateAuditSavedViewBody }
    >({
      query: ({ body }) => ({
        url: '/organizations/audit-logs/saved-views',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { organizationId }) => [
        { type: 'AuditSavedViews', id: organizationId },
      ],
    }),
    deleteAuditSavedView: build.mutation<
      ApiResponse<unknown>,
      { organizationId: string; viewId: string }
    >({
      query: ({ viewId }) => ({
        url: `/organizations/audit-logs/saved-views/${encodeURIComponent(viewId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { organizationId }) => [
        { type: 'AuditSavedViews', id: organizationId },
      ],
    }),
  }),
});

export const {
  useGetAuditLogsSummaryQuery,
  useGetAuditLogsTrendQuery,
  useGetAuditLogsQuery,
  useGetAuditLogDetailQuery,
  useGetDataAccessLogsQuery,
  useGetChangeHistoryLogsQuery,
  useCompareAuditSnapshotsMutation,
  useGetFieldHistoryQuery,
  useGetAuditSavedViewsQuery,
  useCreateAuditSavedViewMutation,
  useDeleteAuditSavedViewMutation,
} = auditLogsApi;
