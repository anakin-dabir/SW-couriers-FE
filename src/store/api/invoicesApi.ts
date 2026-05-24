import { extractPdfDownloadUrl } from '@/lib/pdfDownload';
import { baseApi } from '@/store/api/baseApi';

export type InvoiceLifecycleStatus = 'DRAFT' | 'SENT';
export type InvoicePaymentStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'VOID'
  | 'WRITTEN_OFF'
  | 'REFUNDED'
  | 'DISPUTED';
export type InvoiceSortBy =
  | 'issue_date'
  | 'due_date'
  | 'total'
  | 'paid'
  | 'balance'
  | 'invoice_number';
export type InvoiceSortOrder = 'asc' | 'desc';
export type InvoicePdfStatus = 'NOT_REQUESTED' | 'GENERATING' | 'READY' | 'FAILED';

export const INVOICE_FILTER_STATUSES: readonly InvoiceLifecycleStatus[] = ['DRAFT', 'SENT'];
export const INVOICE_FILTER_PAYMENT_STATUSES: readonly InvoicePaymentStatus[] = [
  'UNPAID',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'VOID',
  'WRITTEN_OFF',
  'REFUNDED',
  'DISPUTED',
];

export interface InvoiceListItem {
  id: string;
  invoice_number: string;
  order_reference: string | null;
  invoiced_date: string;
  due_date: string;
  total: string;
  paid: string;
  credit_applied: string | null;
  balance: string;
  status: InvoiceLifecycleStatus;
  invoice_status: InvoiceLifecycleStatus;
  payment_status: InvoicePaymentStatus;
  refunded_amount: string;
  has_pending_refunds: boolean;
  has_open_dispute: boolean;
}

export interface InvoicesListResponse {
  items: InvoiceListItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
  current_url?: string | null;
  next_url?: string | null;
}

export interface InvoiceSummaryResponse {
  total_invoices: number;
  total_paid: number;
  total_unpaid: number;
  overdue: number;
  with_completed_refunds: number;
  with_open_disputes: number;
}

export interface InvoiceEvent {
  event_type: string;
  reason: string | null;
  actor_id: string | null;
  actor_role: string | null;
  created_at: string;
  display_title: string | null;
}

export interface AppliedCreditNote {
  credit_note_id: string;
  credit_note_number: string;
  applied_amount: string;
  applied_at: string;
  reason: string | null;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  line_type: string;
}

export interface InvoiceRefundSummary {
  refunded_amount: string;
  pending_refund_count: number;
  completed_refund_count: number;
}

export interface InvoiceDetail {
  id: string;
  invoice_number: string;
  order_id: string | null;
  order_reference: string | null;
  organization_id: string | null;
  customer_id: string | null;
  issue_date: string;
  due_date: string;
  subtotal: string;
  vat_rate: string;
  vat_amount: string;
  total: string;
  total_after_credit: string | null;
  paid_amount: string | null;
  outstanding_balance: string | null;
  status: InvoiceLifecycleStatus;
  invoice_status: InvoiceLifecycleStatus;
  payment_status: InvoicePaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  version: number;
  amount_paid: string | null;
  payment_method: string | null;
  events: InvoiceEvent[];
  applied_credit_notes: AppliedCreditNote[];
  line_items: InvoiceLineItem[];
  refund_summary: InvoiceRefundSummary | null;
  has_open_dispute: boolean;
}

export interface InvoicePaymentHistoryItem {
  payment_id: string;
  payment_number: string | null;
  payment_date: string;
  method: string | null;
  transaction_id: string | null;
  allocated_amount: string;
  status: string;
}

export interface InvoicePaymentsResponse {
  items: InvoicePaymentHistoryItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
  current_url?: string | null;
  next_url?: string | null;
}

export interface InvoicePdfJobResponse {
  status: InvoicePdfStatus;
  job_id: string | null;
  error_code: string | null;
  error_message: string | null;
  artifact_id: string | null;
}

export interface InvoicePdfSignedUrlResponse {
  signed_url: string;
  expires_at?: string | null;
}

export interface GetInvoicesArgs {
  page?: number;
  size?: number;
  search?: string;
  status?: InvoiceLifecycleStatus[];
  payment_status?: InvoicePaymentStatus[];
  show_draft?: boolean;
  invoiced_from?: string;
  invoiced_to?: string;
  due_from?: string;
  due_to?: string;
  period?: string;
  organization_id?: string;
  sort_by?: InvoiceSortBy;
  sort_order?: InvoiceSortOrder;
}

export interface GetInvoicePaymentsArgs {
  invoiceId: string;
  page?: number;
  size?: number;
}

export interface RequestInvoicePdfArgs {
  invoiceId: string;
  idempotencyKey?: string;
}

export interface RequestInvoicePdfSignedUrlArgs {
  invoiceId: string;
  disposition: 'inline' | 'attachment';
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

function assertBoolean(value: unknown, message: string): boolean {
  if (typeof value !== 'boolean') throw new Error(message);
  return value;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function parseInvoiceLifecycleStatus(value: unknown, message: string): InvoiceLifecycleStatus {
  const status = assertString(value, message);
  if (status === 'DRAFT' || status === 'SENT') return status;
  throw new Error(`${message}: unsupported invoice lifecycle status "${status}"`);
}

function parseInvoicePaymentStatus(value: unknown, message: string): InvoicePaymentStatus {
  const status = assertString(value, message);
  if (INVOICE_FILTER_PAYMENT_STATUSES.includes(status as InvoicePaymentStatus)) {
    return status as InvoicePaymentStatus;
  }
  throw new Error(`${message}: unsupported invoice payment status "${status}"`);
}

function parsePaginatedMeta(
  data: Record<string, unknown>,
  scope: string
): {
  total: number;
  page: number;
  size: number;
  pages: number;
  current_url?: string | null;
  next_url?: string | null;
} {
  return {
    total: assertNumber(data.total, `${scope}: data.total`),
    page: assertNumber(data.page, `${scope}: data.page`),
    size: assertNumber(data.size, `${scope}: data.size`),
    pages: assertNumber(data.pages, `${scope}: data.pages`),
    current_url: asNullableString(data.current_url),
    next_url: asNullableString(data.next_url),
  };
}

function parseInvoiceListItem(raw: unknown, index: number): InvoiceListItem {
  const row = assertObject(
    raw,
    `Invalid invoices list response: data.items[${index}] is not an object`
  );
  return {
    id: assertString(row.id, `Invalid invoices list response: data.items[${index}].id`),
    invoice_number: assertString(
      row.invoice_number,
      `Invalid invoices list response: data.items[${index}].invoice_number`
    ),
    order_reference: asNullableString(row.order_reference),
    invoiced_date: assertString(
      row.invoiced_date,
      `Invalid invoices list response: data.items[${index}].invoiced_date`
    ),
    due_date: assertString(
      row.due_date,
      `Invalid invoices list response: data.items[${index}].due_date`
    ),
    total: assertString(row.total, `Invalid invoices list response: data.items[${index}].total`),
    paid: assertString(row.paid, `Invalid invoices list response: data.items[${index}].paid`),
    credit_applied: asNullableString(row.credit_applied),
    balance: assertString(
      row.balance,
      `Invalid invoices list response: data.items[${index}].balance`
    ),
    status: parseInvoiceLifecycleStatus(
      row.status,
      `Invalid invoices list response: data.items[${index}].status`
    ),
    invoice_status: parseInvoiceLifecycleStatus(
      row.invoice_status,
      `Invalid invoices list response: data.items[${index}].invoice_status`
    ),
    payment_status: parseInvoicePaymentStatus(
      row.payment_status,
      `Invalid invoices list response: data.items[${index}].payment_status`
    ),
    refunded_amount: assertString(
      row.refunded_amount,
      `Invalid invoices list response: data.items[${index}].refunded_amount`
    ),
    has_pending_refunds: assertBoolean(
      row.has_pending_refunds,
      `Invalid invoices list response: data.items[${index}].has_pending_refunds`
    ),
    has_open_dispute: assertBoolean(
      row.has_open_dispute,
      `Invalid invoices list response: data.items[${index}].has_open_dispute`
    ),
  };
}

function parseInvoicesListResponse(raw: unknown): InvoicesListResponse {
  const obj = assertObject(raw, 'Invalid invoices list response');
  if (obj.success !== true) throw new Error('Invalid invoices list response: success is not true');
  const data = assertObject(obj.data, 'Invalid invoices list response: missing data');
  if (!Array.isArray(data.items)) {
    throw new Error('Invalid invoices list response: data.items is not an array');
  }
  return {
    items: data.items.map((item, index) => parseInvoiceListItem(item, index)),
    ...parsePaginatedMeta(data, 'Invalid invoices list response'),
  };
}

function parseInvoicesSummaryResponse(raw: unknown): InvoiceSummaryResponse {
  const obj = assertObject(raw, 'Invalid invoices summary response');
  if (obj.success !== true)
    throw new Error('Invalid invoices summary response: success is not true');
  const data = assertObject(obj.data, 'Invalid invoices summary response: missing data');
  return {
    total_invoices: assertNumber(
      data.total_invoices,
      'Invalid invoices summary response: data.total_invoices'
    ),
    total_paid: assertNumber(data.total_paid, 'Invalid invoices summary response: data.total_paid'),
    total_unpaid: assertNumber(
      data.total_unpaid,
      'Invalid invoices summary response: data.total_unpaid'
    ),
    overdue: assertNumber(data.overdue, 'Invalid invoices summary response: data.overdue'),
    with_completed_refunds: assertNumber(
      data.with_completed_refunds,
      'Invalid invoices summary response: data.with_completed_refunds'
    ),
    with_open_disputes: assertNumber(
      data.with_open_disputes,
      'Invalid invoices summary response: data.with_open_disputes'
    ),
  };
}

function parseInvoiceEvent(raw: unknown, index: number): InvoiceEvent {
  const row = assertObject(
    raw,
    `Invalid invoice detail response: data.events[${index}] is not an object`
  );
  return {
    event_type: assertString(
      row.event_type,
      `Invalid invoice detail response: data.events[${index}].event_type`
    ),
    reason: asNullableString(row.reason),
    actor_id: asNullableString(row.actor_id),
    actor_role: asNullableString(row.actor_role),
    created_at: assertString(
      row.created_at,
      `Invalid invoice detail response: data.events[${index}].created_at`
    ),
    display_title: asNullableString(row.display_title),
  };
}

function parseAppliedCreditNote(raw: unknown, index: number): AppliedCreditNote {
  const row = assertObject(
    raw,
    `Invalid invoice detail response: data.applied_credit_notes[${index}] is not an object`
  );
  return {
    credit_note_id: assertString(
      row.credit_note_id,
      `Invalid invoice detail response: data.applied_credit_notes[${index}].credit_note_id`
    ),
    credit_note_number: assertString(
      row.credit_note_number,
      `Invalid invoice detail response: data.applied_credit_notes[${index}].credit_note_number`
    ),
    applied_amount: assertString(
      row.applied_amount,
      `Invalid invoice detail response: data.applied_credit_notes[${index}].applied_amount`
    ),
    applied_at: assertString(
      row.applied_at,
      `Invalid invoice detail response: data.applied_credit_notes[${index}].applied_at`
    ),
    reason: asNullableString(row.reason),
  };
}

function parseInvoiceLineItem(raw: unknown, index: number): InvoiceLineItem {
  const row = assertObject(
    raw,
    `Invalid invoice detail response: data.line_items[${index}] is not an object`
  );
  return {
    description: assertString(
      row.description,
      `Invalid invoice detail response: data.line_items[${index}].description`
    ),
    quantity: assertNumber(
      row.quantity,
      `Invalid invoice detail response: data.line_items[${index}].quantity`
    ),
    unit_price: assertString(
      row.unit_price,
      `Invalid invoice detail response: data.line_items[${index}].unit_price`
    ),
    total_price: assertString(
      row.total_price,
      `Invalid invoice detail response: data.line_items[${index}].total_price`
    ),
    line_type: assertString(
      row.line_type,
      `Invalid invoice detail response: data.line_items[${index}].line_type`
    ),
  };
}

function parseRefundSummary(raw: unknown): InvoiceRefundSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  return {
    refunded_amount: assertString(
      row.refunded_amount,
      'Invalid invoice detail response: data.refund_summary.refunded_amount'
    ),
    pending_refund_count: assertNumber(
      row.pending_refund_count,
      'Invalid invoice detail response: data.refund_summary.pending_refund_count'
    ),
    completed_refund_count: assertNumber(
      row.completed_refund_count,
      'Invalid invoice detail response: data.refund_summary.completed_refund_count'
    ),
  };
}

function parseInvoiceDetailResponse(raw: unknown): InvoiceDetail {
  const obj = assertObject(raw, 'Invalid invoice detail response');
  if (obj.success !== true) throw new Error('Invalid invoice detail response: success is not true');
  const data = assertObject(obj.data, 'Invalid invoice detail response: missing data');
  const eventsRaw = Array.isArray(data.events) ? data.events : [];
  const appliedCreditNotesRaw = Array.isArray(data.applied_credit_notes)
    ? data.applied_credit_notes
    : [];
  const lineItemsRaw = Array.isArray(data.line_items) ? data.line_items : [];
  return {
    id: assertString(data.id, 'Invalid invoice detail response: data.id'),
    invoice_number: assertString(
      data.invoice_number,
      'Invalid invoice detail response: data.invoice_number'
    ),
    order_id: asNullableString(data.order_id),
    order_reference: asNullableString(data.order_reference),
    organization_id: asNullableString(data.organization_id),
    customer_id: asNullableString(data.customer_id),
    issue_date: assertString(data.issue_date, 'Invalid invoice detail response: data.issue_date'),
    due_date: assertString(data.due_date, 'Invalid invoice detail response: data.due_date'),
    subtotal: assertString(data.subtotal, 'Invalid invoice detail response: data.subtotal'),
    vat_rate: assertString(data.vat_rate, 'Invalid invoice detail response: data.vat_rate'),
    vat_amount: assertString(data.vat_amount, 'Invalid invoice detail response: data.vat_amount'),
    total: assertString(data.total, 'Invalid invoice detail response: data.total'),
    total_after_credit: asNullableString(data.total_after_credit),
    paid_amount: asNullableString(data.paid_amount),
    outstanding_balance: asNullableString(data.outstanding_balance),
    status: parseInvoiceLifecycleStatus(
      data.status,
      'Invalid invoice detail response: data.status'
    ),
    invoice_status: parseInvoiceLifecycleStatus(
      data.invoice_status,
      'Invalid invoice detail response: data.invoice_status'
    ),
    payment_status: parseInvoicePaymentStatus(
      data.payment_status,
      'Invalid invoice detail response: data.payment_status'
    ),
    notes: asNullableString(data.notes),
    created_at: assertString(data.created_at, 'Invalid invoice detail response: data.created_at'),
    updated_at: assertString(data.updated_at, 'Invalid invoice detail response: data.updated_at'),
    version: assertNumber(data.version, 'Invalid invoice detail response: data.version'),
    amount_paid: asNullableString(data.amount_paid),
    payment_method: asNullableString(data.payment_method),
    events: eventsRaw.map((item, index) => parseInvoiceEvent(item, index)),
    applied_credit_notes: appliedCreditNotesRaw.map((item, index) =>
      parseAppliedCreditNote(item, index)
    ),
    line_items: lineItemsRaw.map((item, index) => parseInvoiceLineItem(item, index)),
    refund_summary: parseRefundSummary(data.refund_summary),
    has_open_dispute: assertBoolean(
      data.has_open_dispute,
      'Invalid invoice detail response: data.has_open_dispute'
    ),
  };
}

function parseInvoicePaymentHistoryItem(raw: unknown, index: number): InvoicePaymentHistoryItem {
  const row = assertObject(
    raw,
    `Invalid invoice payments response: data.items[${index}] is not an object`
  );
  return {
    payment_id: assertString(
      row.payment_id,
      `Invalid invoice payments response: data.items[${index}].payment_id`
    ),
    payment_number: asNullableString(row.payment_number),
    payment_date: assertString(
      row.payment_date,
      `Invalid invoice payments response: data.items[${index}].payment_date`
    ),
    method: asNullableString(row.method),
    transaction_id: asNullableString(row.transaction_id),
    allocated_amount: assertString(
      row.allocated_amount,
      `Invalid invoice payments response: data.items[${index}].allocated_amount`
    ),
    status: assertString(
      row.status,
      `Invalid invoice payments response: data.items[${index}].status`
    ),
  };
}

function parseInvoicePaymentsResponse(raw: unknown): InvoicePaymentsResponse {
  const obj = assertObject(raw, 'Invalid invoice payments response');
  if (obj.success !== true)
    throw new Error('Invalid invoice payments response: success is not true');
  const data = assertObject(obj.data, 'Invalid invoice payments response: missing data');
  if (!Array.isArray(data.items)) {
    throw new Error('Invalid invoice payments response: data.items is not an array');
  }
  return {
    items: data.items.map((item, index) => parseInvoicePaymentHistoryItem(item, index)),
    ...parsePaginatedMeta(data, 'Invalid invoice payments response'),
  };
}

function parseSimpleSuccessData(raw: unknown, scope: string): Record<string, unknown> {
  const obj = assertObject(raw, scope);
  if (obj.success !== true) throw new Error(`${scope}: success is not true`);
  return assertObject(obj.data, `${scope}: missing data`);
}

function parseInvoicePdfResponse(raw: unknown, scope: string): InvoicePdfJobResponse {
  const data = parseSimpleSuccessData(raw, scope);
  return {
    status: assertString(data.status, `${scope}: data.status`) as InvoicePdfStatus,
    job_id: asNullableString(data.job_id),
    error_code: asNullableString(data.error_code),
    error_message: asNullableString(data.error_message),
    artifact_id: asNullableString(data.artifact_id),
  };
}

function parseInvoicePdfSignedUrlResponse(raw: unknown): InvoicePdfSignedUrlResponse {
  const data = parseSimpleSuccessData(raw, 'Invalid invoice PDF signed URL response');
  const downloadUrl = extractPdfDownloadUrl(data);
  if (!downloadUrl) {
    throw new Error('Invalid invoice PDF signed URL response: missing data.url');
  }
  return {
    signed_url: downloadUrl,
    expires_at: asNullableString(data.expires_at),
  };
}

export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInvoices: build.query<InvoicesListResponse, GetInvoicesArgs>({
      query: (args) => ({
        url: '/invoices',
        params: args,
      }),
      transformResponse: (raw: unknown) => parseInvoicesListResponse(raw),
      providesTags: ['BillingInvoiceList'],
    }),
    getInvoicesSummary: build.query<InvoiceSummaryResponse, Partial<GetInvoicesArgs> | undefined>({
      query: (args) => ({
        url: '/invoices/summary',
        params: args ?? undefined,
      }),
      transformResponse: (raw: unknown) => parseInvoicesSummaryResponse(raw),
      providesTags: ['BillingInvoiceSummary'],
    }),
    getInvoiceById: build.query<InvoiceDetail, { invoiceId: string }>({
      query: ({ invoiceId }) => `/invoices/${encodeURIComponent(invoiceId)}`,
      transformResponse: (raw: unknown) => parseInvoiceDetailResponse(raw),
      providesTags: (_result, _error, arg) => [{ type: 'BillingInvoiceDetail', id: arg.invoiceId }],
    }),
    getInvoicePayments: build.query<InvoicePaymentsResponse, GetInvoicePaymentsArgs>({
      query: ({ invoiceId, ...params }) => ({
        url: `/invoices/${encodeURIComponent(invoiceId)}/payments`,
        params,
      }),
      transformResponse: (raw: unknown) => parseInvoicePaymentsResponse(raw),
      providesTags: (_result, _error, arg) => [
        { type: 'BillingInvoicePayments', id: arg.invoiceId },
      ],
    }),
    requestInvoicePdf: build.mutation<InvoicePdfJobResponse, RequestInvoicePdfArgs>({
      query: ({ invoiceId, idempotencyKey }) => ({
        url: `/invoices/${encodeURIComponent(invoiceId)}/pdf`,
        method: 'POST',
        headers: idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : undefined,
      }),
      transformResponse: (raw: unknown) =>
        parseInvoicePdfResponse(raw, 'Invalid invoice PDF request response'),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'BillingInvoicePdfStatus', id: arg.invoiceId },
      ],
    }),
    getInvoicePdfStatus: build.query<InvoicePdfJobResponse, { invoiceId: string }>({
      query: ({ invoiceId }) => `/invoices/${encodeURIComponent(invoiceId)}/pdf`,
      transformResponse: (raw: unknown) =>
        parseInvoicePdfResponse(raw, 'Invalid invoice PDF status response'),
      providesTags: (_result, _error, arg) => [
        { type: 'BillingInvoicePdfStatus', id: arg.invoiceId },
      ],
    }),
    getInvoicePdfSignedUrl: build.mutation<
      InvoicePdfSignedUrlResponse,
      RequestInvoicePdfSignedUrlArgs
    >({
      query: ({ invoiceId, disposition }) => ({
        url: `/invoices/${encodeURIComponent(invoiceId)}/pdf/signed-url`,
        method: 'POST',
        body: { disposition },
      }),
      transformResponse: (raw: unknown) => parseInvoicePdfSignedUrlResponse(raw),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetInvoicesQuery,
  useGetInvoicesSummaryQuery,
  useGetInvoiceByIdQuery,
  useGetInvoicePaymentsQuery,
  useRequestInvoicePdfMutation,
  useGetInvoicePdfStatusQuery,
  useGetInvoicePdfSignedUrlMutation,
} = invoicesApi;
