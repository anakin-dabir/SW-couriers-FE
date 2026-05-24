import { baseApi } from '@/store/api/baseApi';

export type BillingRefundStatus = 'INITIATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
export type BillingRefundType = 'FULL' | 'PARTIAL';
export type BillingRefundMethod = 'CARD_REFUND' | 'BANK_TRANSFER' | 'CREDIT_NOTE';
export type BillingRefundReasonCategory =
  | 'BOOKING_CANCELLED'
  | 'SERVICE_FAILURE'
  | 'DUPLICATE_PAYMENT'
  | 'BILLING_ERROR'
  | 'CLIENT_REQUEST'
  | 'VOIDED_INVOICE'
  | 'OTHER';

/**
 * Canonical multi-select values for GET .../refunds and .../refunds/kpis
 * (query params: status, refund_type, refund_method, reason_category).
 */
export const BILLING_REFUND_FILTER_STATUSES: readonly BillingRefundStatus[] = [
  'INITIATED',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'REVERSED',
];

export const BILLING_REFUND_FILTER_TYPES: readonly BillingRefundType[] = ['FULL', 'PARTIAL'];

export const BILLING_REFUND_FILTER_METHODS: readonly BillingRefundMethod[] = [
  'CARD_REFUND',
  'BANK_TRANSFER',
  'CREDIT_NOTE',
];

export const BILLING_REFUND_FILTER_REASON_CATEGORIES: readonly BillingRefundReasonCategory[] = [
  'BOOKING_CANCELLED',
  'SERVICE_FAILURE',
  'DUPLICATE_PAYMENT',
  'BILLING_ERROR',
  'CLIENT_REQUEST',
  'VOIDED_INVOICE',
  'OTHER',
];

export interface BillingRefundListItem {
  id: string;
  refund_number: string;
  payment_id: string | null;
  payment_number: string | null;
  invoice_id: string | null;
  invoice_number: string | null;
  linked_booking_ref: string | null;
  refund_date: string;
  amount: string;
  refund_type: BillingRefundType;
  refund_method: BillingRefundMethod;
  status: BillingRefundStatus;
  reason_category: BillingRefundReasonCategory;
  braintree_transaction_id: string | null;
  braintree_status: string | null;
}

export interface BillingRefundListResponse {
  items: BillingRefundListItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface BillingRefundKpis {
  total_refund_amount: string;
  refunds_this_month: number;
  pending_refunds: number;
  failed_refunds: number;
  avg_refund_time_days: number;
}

export interface BillingRefundEvent {
  id: string;
  event_type: string;
  actor_id: string | null;
  payload_json: Record<string, unknown> | null;
  created_at: string;
}

export interface BillingRefundDetail {
  id: string;
  refund_number: string;
  organization_id: string;
  billing_payment_id: string | null;
  invoice_id: string | null;
  linked_booking_ref: string | null;
  provider: string | null;
  refund_method: BillingRefundMethod;
  refund_type: BillingRefundType;
  status: BillingRefundStatus;
  reason_category: BillingRefundReasonCategory;
  reason_description: string | null;
  requested_amount: string;
  processed_amount: string;
  currency: string | null;
  braintree_transaction_id: string | null;
  braintree_status: string | null;
  braintree_status_updated_at: string | null;
  retry_count: number;
  initiated_by_id: string | null;
  initiated_at: string;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface BillingRefundDetailResponse {
  refund: BillingRefundDetail;
  events: BillingRefundEvent[];
}

export interface GetBillingRefundsArgs {
  page?: number;
  size?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  status?: BillingRefundStatus[];
  refund_type?: BillingRefundType[];
  refund_method?: BillingRefundMethod[];
  reason_category?: BillingRefundReasonCategory[];
}

export interface GetBillingRefundKpisArgs {
  date_from?: string;
  date_to?: string;
  status?: BillingRefundStatus[];
  refund_type?: BillingRefundType[];
  refund_method?: BillingRefundMethod[];
  reason_category?: BillingRefundReasonCategory[];
}

function assertObject(raw: unknown, message: string): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') throw new Error(message);
  return raw as Record<string, unknown>;
}

function assertString(value: unknown, message: string): string {
  if (typeof value !== 'string') throw new Error(message);
  return value;
}

function assertNumber(value: unknown, message: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) throw new Error(message);
  return value;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function parseBillingRefundListItem(raw: unknown, index: number): BillingRefundListItem {
  const row = assertObject(raw, `Invalid refunds response: data.items[${index}] is not an object`);
  return {
    id: assertString(row.id, `Invalid refunds response: data.items[${index}].id`),
    refund_number: assertString(
      row.refund_number,
      `Invalid refunds response: data.items[${index}].refund_number`
    ),
    payment_id: asNullableString(row.payment_id),
    payment_number: asNullableString(row.payment_number),
    invoice_id: asNullableString(row.invoice_id),
    invoice_number: asNullableString(row.invoice_number),
    linked_booking_ref: asNullableString(row.linked_booking_ref),
    refund_date: assertString(
      row.refund_date,
      `Invalid refunds response: data.items[${index}].refund_date`
    ),
    amount: assertString(row.amount, `Invalid refunds response: data.items[${index}].amount`),
    refund_type: assertString(
      row.refund_type,
      `Invalid refunds response: data.items[${index}].refund_type`
    ) as BillingRefundType,
    refund_method: assertString(
      row.refund_method,
      `Invalid refunds response: data.items[${index}].refund_method`
    ) as BillingRefundMethod,
    status: assertString(
      row.status,
      `Invalid refunds response: data.items[${index}].status`
    ) as BillingRefundStatus,
    reason_category: assertString(
      row.reason_category,
      `Invalid refunds response: data.items[${index}].reason_category`
    ) as BillingRefundReasonCategory,
    braintree_transaction_id: asNullableString(row.braintree_transaction_id),
    braintree_status: asNullableString(row.braintree_status),
  };
}

function parseRefundsListResponse(raw: unknown): BillingRefundListResponse {
  const obj = assertObject(raw, 'Invalid refunds list response');
  if (obj.success !== true) throw new Error('Invalid refunds list response: success is not true');
  const data = assertObject(obj.data, 'Invalid refunds list response: missing data');
  if (!Array.isArray(data.items)) {
    throw new Error('Invalid refunds list response: data.items is not an array');
  }

  return {
    items: data.items.map((item, index) => parseBillingRefundListItem(item, index)),
    total: assertNumber(data.total, 'Invalid refunds list response: data.total'),
    page: assertNumber(data.page, 'Invalid refunds list response: data.page'),
    size: assertNumber(data.size, 'Invalid refunds list response: data.size'),
    pages: assertNumber(data.pages, 'Invalid refunds list response: data.pages'),
  };
}

function parseRefundKpisResponse(raw: unknown): BillingRefundKpis {
  const obj = assertObject(raw, 'Invalid refund KPIs response');
  if (obj.success !== true) throw new Error('Invalid refund KPIs response: success is not true');
  const data = assertObject(obj.data, 'Invalid refund KPIs response: missing data');

  return {
    total_refund_amount: assertString(
      data.total_refund_amount,
      'Invalid refund KPIs response: data.total_refund_amount'
    ),
    refunds_this_month: assertNumber(
      data.refunds_this_month,
      'Invalid refund KPIs response: data.refunds_this_month'
    ),
    pending_refunds: assertNumber(
      data.pending_refunds,
      'Invalid refund KPIs response: data.pending_refunds'
    ),
    failed_refunds: assertNumber(
      data.failed_refunds,
      'Invalid refund KPIs response: data.failed_refunds'
    ),
    avg_refund_time_days: assertNumber(
      data.avg_refund_time_days,
      'Invalid refund KPIs response: data.avg_refund_time_days'
    ),
  };
}

function parseRefundEvent(raw: unknown, index: number): BillingRefundEvent {
  const row = assertObject(
    raw,
    `Invalid refund detail response: data.events[${index}] is not an object`
  );
  return {
    id: assertString(row.id, `Invalid refund detail response: data.events[${index}].id`),
    event_type: assertString(
      row.event_type,
      `Invalid refund detail response: data.events[${index}].event_type`
    ),
    actor_id: asNullableString(row.actor_id),
    payload_json:
      row.payload_json && typeof row.payload_json === 'object'
        ? (row.payload_json as Record<string, unknown>)
        : null,
    created_at: assertString(
      row.created_at,
      `Invalid refund detail response: data.events[${index}].created_at`
    ),
  };
}

function parseRefundDetailResponse(raw: unknown): BillingRefundDetailResponse {
  const obj = assertObject(raw, 'Invalid refund detail response');
  if (obj.success !== true) throw new Error('Invalid refund detail response: success is not true');
  const data = assertObject(obj.data, 'Invalid refund detail response: missing data');
  const refund = assertObject(data.refund, 'Invalid refund detail response: missing data.refund');
  const eventsRaw = data.events;
  if (!Array.isArray(eventsRaw)) {
    throw new Error('Invalid refund detail response: data.events is not an array');
  }

  return {
    refund: {
      id: assertString(refund.id, 'Invalid refund detail response: data.refund.id'),
      refund_number: assertString(
        refund.refund_number,
        'Invalid refund detail response: data.refund.refund_number'
      ),
      organization_id: assertString(
        refund.organization_id,
        'Invalid refund detail response: data.refund.organization_id'
      ),
      billing_payment_id: asNullableString(refund.billing_payment_id),
      invoice_id: asNullableString(refund.invoice_id),
      linked_booking_ref: asNullableString(refund.linked_booking_ref),
      provider: asNullableString(refund.provider),
      refund_method: assertString(
        refund.refund_method,
        'Invalid refund detail response: data.refund.refund_method'
      ) as BillingRefundMethod,
      refund_type: assertString(
        refund.refund_type,
        'Invalid refund detail response: data.refund.refund_type'
      ) as BillingRefundType,
      status: assertString(
        refund.status,
        'Invalid refund detail response: data.refund.status'
      ) as BillingRefundStatus,
      reason_category: assertString(
        refund.reason_category,
        'Invalid refund detail response: data.refund.reason_category'
      ) as BillingRefundReasonCategory,
      reason_description: asNullableString(refund.reason_description),
      requested_amount: assertString(
        refund.requested_amount,
        'Invalid refund detail response: data.refund.requested_amount'
      ),
      processed_amount: assertString(
        refund.processed_amount,
        'Invalid refund detail response: data.refund.processed_amount'
      ),
      currency: asNullableString(refund.currency),
      braintree_transaction_id: asNullableString(refund.braintree_transaction_id),
      braintree_status: asNullableString(refund.braintree_status),
      braintree_status_updated_at: asNullableString(refund.braintree_status_updated_at),
      retry_count: assertNumber(
        refund.retry_count,
        'Invalid refund detail response: data.refund.retry_count'
      ),
      initiated_by_id: asNullableString(refund.initiated_by_id),
      initiated_at: assertString(
        refund.initiated_at,
        'Invalid refund detail response: data.refund.initiated_at'
      ),
      metadata_json:
        refund.metadata_json && typeof refund.metadata_json === 'object'
          ? (refund.metadata_json as Record<string, unknown>)
          : null,
      created_at: assertString(
        refund.created_at,
        'Invalid refund detail response: data.refund.created_at'
      ),
      updated_at: assertString(
        refund.updated_at,
        'Invalid refund detail response: data.refund.updated_at'
      ),
    },
    events: eventsRaw.map((event, index) => parseRefundEvent(event, index)),
  };
}

export const refundsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBillingRefunds: build.query<BillingRefundListResponse, GetBillingRefundsArgs>({
      query: (args) => ({
        url: '/billing/b2b/refunds',
        params: args,
      }),
      transformResponse: (raw: unknown) => parseRefundsListResponse(raw),
      providesTags: ['BillingRefundList'],
    }),
    getBillingRefundKpis: build.query<BillingRefundKpis, GetBillingRefundKpisArgs>({
      query: (args) => ({
        url: '/billing/b2b/refunds/kpis',
        params: args,
      }),
      transformResponse: (raw: unknown) => parseRefundKpisResponse(raw),
      providesTags: ['BillingRefundKpis'],
    }),
    getBillingRefundDetail: build.query<BillingRefundDetailResponse, { refundId: string }>({
      query: ({ refundId }) => `/billing/b2b/refunds/${encodeURIComponent(refundId)}`,
      transformResponse: (raw: unknown) => parseRefundDetailResponse(raw),
      providesTags: (_result, _error, arg) => [{ type: 'BillingRefundDetail', id: arg.refundId }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetBillingRefundsQuery,
  useGetBillingRefundKpisQuery,
  useGetBillingRefundDetailQuery,
} = refundsApi;
