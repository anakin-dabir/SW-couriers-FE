import { baseApi } from '@/store/api/baseApi';
import { extractPdfDownloadUrl } from '@/lib/pdfDownload';

export type BillingCreditNoteStatus = 'OPEN' | 'PARTIALLY_APPLIED' | 'FULLY_APPLIED' | 'VOID';
export type BillingCreditNoteReasonCategory =
  | 'BILLING_ERROR'
  | 'SERVICE_FAILURE'
  | 'CLIENT_REQUEST'
  | 'OTHER';
export type BillingCreditNoteSortBy = 'issue_date' | 'amount' | 'credit_note_number';
export type BillingSortOrder = 'asc' | 'desc';
export type BillingPaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'PAID';

const BILLING_PAYMENT_STATUSES = ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE', 'PAID'] as const;

export const BILLING_CREDIT_NOTE_FILTER_STATUSES: readonly BillingCreditNoteStatus[] = [
  'OPEN',
  'PARTIALLY_APPLIED',
  'FULLY_APPLIED',
  'VOID',
];
export const BILLING_CREDIT_NOTE_FILTER_REASON_CATEGORIES: readonly BillingCreditNoteReasonCategory[] =
  ['BILLING_ERROR', 'SERVICE_FAILURE', 'CLIENT_REQUEST', 'OTHER'];

export interface BillingCreditNoteListItem {
  id: string;
  credit_note_number: string;
  issue_date: string;
  total_credit_amount: string;
  applied_amount: string;
  remaining_amount: string;
  status: BillingCreditNoteStatus;
  reason_category: BillingCreditNoteReasonCategory;
  reason: string | null;
  source_invoice_id: string | null;
  source_invoice_number: string | null;
  /** Invoice applications when returned by GET list (often omitted). */
  applications?: BillingCreditNoteApplication[];
}

export interface BillingCreditNotesListResponse {
  items: BillingCreditNoteListItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface BillingCreditNoteApplication {
  invoice_id: string;
  invoice_number: string;
  applied_amount: string;
  applied_at: string;
}

export interface BillingCreditNoteDetail {
  id: string;
  credit_note_number: string;
  organization_id: string;
  customer_id: string;
  source_invoice_id: string | null;
  source_invoice_number: string | null;
  issue_date: string;
  total_credit_amount: string;
  applied_amount: string;
  remaining_amount: string;
  status: BillingCreditNoteStatus;
  reason_category: BillingCreditNoteReasonCategory;
  reason: string | null;
  currency: string | null;
  sent_to_email: string | null;
  sent_at: string | null;
  applications: BillingCreditNoteApplication[];
}

export interface BillingCreditNoteInvoiceCandidate {
  invoice_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  payment_status: BillingPaymentStatus;
  outstanding_amount: string;
}

export interface BillingCreditNoteInvoiceCandidatesResponse {
  items: BillingCreditNoteInvoiceCandidate[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface BillingCreditNotePdfJobResponse {
  status: string;
  artifact_id: string;
  job_id?: string | null;
}

export interface BillingCreditNotePdfStatusResponse {
  status: string;
  artifact_id: string;
}

export interface BillingCreditNotePdfSignedUrlResponse {
  signed_url: string;
  expires_at?: string | null;
}

export interface GetBillingCreditNotesArgs {
  page?: number;
  size?: number;
  search?: string;
  status?: BillingCreditNoteStatus[];
  reason_category?: BillingCreditNoteReasonCategory[];
  issued_from?: string;
  issued_to?: string;
  sort_by?: BillingCreditNoteSortBy;
  sort_order?: BillingSortOrder;
}

export interface GetBillingCreditNoteInvoiceCandidatesArgs {
  creditNoteId: string;
  page?: number;
  size?: number;
  search?: string;
}

export interface ApplyBillingCreditNoteArgs {
  creditNoteId: string;
  invoice_id: string;
}

export interface RequestBillingCreditNoteSignedUrlArgs {
  creditNoteId: string;
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

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function parseBillingPaymentStatus(value: unknown, message: string): BillingPaymentStatus {
  const status = assertString(value, message);
  if (BILLING_PAYMENT_STATUSES.includes(status as BillingPaymentStatus)) {
    return status as BillingPaymentStatus;
  }
  throw new Error(`${message}: unsupported payment status "${status}"`);
}

function parsePaginatedMeta(
  data: Record<string, unknown>,
  scope: string
): {
  total: number;
  page: number;
  size: number;
  pages: number;
} {
  return {
    total: assertNumber(data.total, `${scope}: data.total`),
    page: assertNumber(data.page, `${scope}: data.page`),
    size: assertNumber(data.size, `${scope}: data.size`),
    pages: assertNumber(data.pages, `${scope}: data.pages`),
  };
}

function parseCreditNoteListItem(raw: unknown, index: number): BillingCreditNoteListItem {
  const row = assertObject(
    raw,
    `Invalid credit notes list response: data.items[${index}] is not an object`
  );
  const applicationsRaw = row.applications;
  const applications =
    Array.isArray(applicationsRaw) && applicationsRaw.length > 0
      ? applicationsRaw.flatMap((app, appIdx) => {
          try {
            return [parseCreditNoteApplication(app, appIdx)];
          } catch {
            return [];
          }
        })
      : undefined;

  return {
    id: assertString(row.id, `Invalid credit notes list response: data.items[${index}].id`),
    credit_note_number: assertString(
      row.credit_note_number,
      `Invalid credit notes list response: data.items[${index}].credit_note_number`
    ),
    issue_date: assertString(
      row.issue_date,
      `Invalid credit notes list response: data.items[${index}].issue_date`
    ),
    total_credit_amount: assertString(
      row.total_credit_amount,
      `Invalid credit notes list response: data.items[${index}].total_credit_amount`
    ),
    applied_amount: assertString(
      row.applied_amount,
      `Invalid credit notes list response: data.items[${index}].applied_amount`
    ),
    remaining_amount: assertString(
      row.remaining_amount,
      `Invalid credit notes list response: data.items[${index}].remaining_amount`
    ),
    status: assertString(
      row.status,
      `Invalid credit notes list response: data.items[${index}].status`
    ) as BillingCreditNoteStatus,
    reason_category: assertString(
      row.reason_category,
      `Invalid credit notes list response: data.items[${index}].reason_category`
    ) as BillingCreditNoteReasonCategory,
    reason: asNullableString(row.reason),
    source_invoice_id: asNullableString(row.source_invoice_id),
    source_invoice_number: asNullableString(row.source_invoice_number),
    ...(applications && applications.length > 0 ? { applications } : {}),
  };
}

function parseCreditNotesListResponse(raw: unknown): BillingCreditNotesListResponse {
  const obj = assertObject(raw, 'Invalid credit notes list response');
  if (obj.success !== true)
    throw new Error('Invalid credit notes list response: success is not true');
  const data = assertObject(obj.data, 'Invalid credit notes list response: missing data');
  if (!Array.isArray(data.items)) {
    throw new Error('Invalid credit notes list response: data.items is not an array');
  }
  const meta = parsePaginatedMeta(data, 'Invalid credit notes list response');
  return {
    items: data.items.map((item, index) => parseCreditNoteListItem(item, index)),
    ...meta,
  };
}

function parseCreditNoteApplication(raw: unknown, index: number): BillingCreditNoteApplication {
  const row = assertObject(
    raw,
    `Invalid credit note detail response: data.applications[${index}] is not an object`
  );
  return {
    invoice_id: assertString(
      row.invoice_id,
      `Invalid credit note detail response: data.applications[${index}].invoice_id`
    ),
    invoice_number: assertString(
      row.invoice_number,
      `Invalid credit note detail response: data.applications[${index}].invoice_number`
    ),
    applied_amount: assertString(
      row.applied_amount,
      `Invalid credit note detail response: data.applications[${index}].applied_amount`
    ),
    applied_at: assertString(
      row.applied_at,
      `Invalid credit note detail response: data.applications[${index}].applied_at`
    ),
  };
}

function parseCreditNoteDetailResponse(raw: unknown): BillingCreditNoteDetail {
  const obj = assertObject(raw, 'Invalid credit note detail response');
  if (obj.success !== true)
    throw new Error('Invalid credit note detail response: success is not true');
  const data = assertObject(obj.data, 'Invalid credit note detail response: missing data');
  const applicationsRaw = data.applications;
  if (!Array.isArray(applicationsRaw)) {
    throw new Error('Invalid credit note detail response: data.applications is not an array');
  }
  return {
    id: assertString(data.id, 'Invalid credit note detail response: data.id'),
    credit_note_number: assertString(
      data.credit_note_number,
      'Invalid credit note detail response: data.credit_note_number'
    ),
    organization_id: assertString(
      data.organization_id,
      'Invalid credit note detail response: data.organization_id'
    ),
    customer_id: assertString(
      data.customer_id,
      'Invalid credit note detail response: data.customer_id'
    ),
    source_invoice_id: asNullableString(data.source_invoice_id),
    source_invoice_number: asNullableString(data.source_invoice_number),
    issue_date: assertString(
      data.issue_date,
      'Invalid credit note detail response: data.issue_date'
    ),
    total_credit_amount: assertString(
      data.total_credit_amount,
      'Invalid credit note detail response: data.total_credit_amount'
    ),
    applied_amount: assertString(
      data.applied_amount,
      'Invalid credit note detail response: data.applied_amount'
    ),
    remaining_amount: assertString(
      data.remaining_amount,
      'Invalid credit note detail response: data.remaining_amount'
    ),
    status: assertString(
      data.status,
      'Invalid credit note detail response: data.status'
    ) as BillingCreditNoteStatus,
    reason_category: assertString(
      data.reason_category,
      'Invalid credit note detail response: data.reason_category'
    ) as BillingCreditNoteReasonCategory,
    reason: asNullableString(data.reason),
    currency: asNullableString(data.currency),
    sent_to_email: asNullableString(data.sent_to_email),
    sent_at: asNullableString(data.sent_at),
    applications: applicationsRaw.map((item, index) => parseCreditNoteApplication(item, index)),
  };
}

function parseCreditNoteInvoiceCandidate(
  raw: unknown,
  index: number
): BillingCreditNoteInvoiceCandidate {
  const row = assertObject(
    raw,
    `Invalid credit note invoice candidates response: data.items[${index}] is not an object`
  );
  return {
    invoice_id: assertString(
      row.invoice_id,
      `Invalid credit note invoice candidates response: data.items[${index}].invoice_id`
    ),
    invoice_number: assertString(
      row.invoice_number,
      `Invalid credit note invoice candidates response: data.items[${index}].invoice_number`
    ),
    issue_date: assertString(
      row.issue_date,
      `Invalid credit note invoice candidates response: data.items[${index}].issue_date`
    ),
    due_date: assertString(
      row.due_date,
      `Invalid credit note invoice candidates response: data.items[${index}].due_date`
    ),
    payment_status: parseBillingPaymentStatus(
      row.payment_status,
      `Invalid credit note invoice candidates response: data.items[${index}].payment_status`
    ),
    outstanding_amount: assertString(
      row.outstanding_amount,
      `Invalid credit note invoice candidates response: data.items[${index}].outstanding_amount`
    ),
  };
}

function parseCreditNoteInvoiceCandidatesResponse(
  raw: unknown
): BillingCreditNoteInvoiceCandidatesResponse {
  const obj = assertObject(raw, 'Invalid credit note invoice candidates response');
  if (obj.success !== true) {
    throw new Error('Invalid credit note invoice candidates response: success is not true');
  }
  const data = assertObject(
    obj.data,
    'Invalid credit note invoice candidates response: missing data'
  );
  if (!Array.isArray(data.items)) {
    throw new Error('Invalid credit note invoice candidates response: data.items is not an array');
  }
  const meta = parsePaginatedMeta(data, 'Invalid credit note invoice candidates response');
  return {
    items: data.items.map((item, index) => parseCreditNoteInvoiceCandidate(item, index)),
    ...meta,
  };
}

function parseSimpleSuccessData(raw: unknown, scope: string): Record<string, unknown> {
  const obj = assertObject(raw, scope);
  if (obj.success !== true) throw new Error(`${scope}: success is not true`);
  return assertObject(obj.data, `${scope}: missing data`);
}

function parsePdfJobResponse(raw: unknown): BillingCreditNotePdfJobResponse {
  const data = parseSimpleSuccessData(raw, 'Invalid credit note PDF request response');
  return {
    status: assertString(data.status, 'Invalid credit note PDF request response: data.status'),
    artifact_id: assertString(
      data.artifact_id,
      'Invalid credit note PDF request response: data.artifact_id'
    ),
    job_id: asNullableString(data.job_id),
  };
}

function parsePdfStatusResponse(raw: unknown): BillingCreditNotePdfStatusResponse {
  const data = parseSimpleSuccessData(raw, 'Invalid credit note PDF status response');
  return {
    status: assertString(data.status, 'Invalid credit note PDF status response: data.status'),
    artifact_id: assertString(
      data.artifact_id,
      'Invalid credit note PDF status response: data.artifact_id'
    ),
  };
}

function parsePdfSignedUrlResponse(raw: unknown): BillingCreditNotePdfSignedUrlResponse {
  const data = parseSimpleSuccessData(raw, 'Invalid credit note PDF signed URL response');
  const downloadUrl = extractPdfDownloadUrl(data);
  if (!downloadUrl) {
    throw new Error('Invalid credit note PDF signed URL response: missing data.url');
  }
  return {
    signed_url: downloadUrl,
    expires_at: asNullableString(data.expires_at),
  };
}

export const creditNotesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBillingCreditNotes: build.query<BillingCreditNotesListResponse, GetBillingCreditNotesArgs>({
      query: (args) => ({
        url: '/billing/b2b/credit-notes',
        params: args,
      }),
      transformResponse: (raw: unknown) => parseCreditNotesListResponse(raw),
      providesTags: ['BillingCreditNoteList'],
    }),
    getBillingCreditNoteDetail: build.query<BillingCreditNoteDetail, { creditNoteId: string }>({
      query: ({ creditNoteId }) => `/billing/b2b/credit-notes/${encodeURIComponent(creditNoteId)}`,
      transformResponse: (raw: unknown) => parseCreditNoteDetailResponse(raw),
      providesTags: (_result, _error, arg) => [
        { type: 'BillingCreditNoteDetail', id: arg.creditNoteId },
      ],
    }),
    getBillingCreditNoteInvoiceCandidates: build.query<
      BillingCreditNoteInvoiceCandidatesResponse,
      GetBillingCreditNoteInvoiceCandidatesArgs
    >({
      query: ({ creditNoteId, ...params }) => ({
        url: `/billing/b2b/credit-notes/${encodeURIComponent(creditNoteId)}/invoice-candidates`,
        params,
      }),
      transformResponse: (raw: unknown) => parseCreditNoteInvoiceCandidatesResponse(raw),
      providesTags: (_result, _error, arg) => [
        { type: 'BillingCreditNoteCandidates', id: arg.creditNoteId },
      ],
    }),
    applyBillingCreditNote: build.mutation<Record<string, unknown>, ApplyBillingCreditNoteArgs>({
      query: ({ creditNoteId, invoice_id }) => ({
        url: `/billing/b2b/credit-notes/${encodeURIComponent(creditNoteId)}/apply`,
        method: 'POST',
        body: { invoice_id },
      }),
      invalidatesTags: (_result, _error, arg) => [
        'BillingCreditNoteList',
        { type: 'BillingCreditNoteDetail', id: arg.creditNoteId },
        { type: 'BillingCreditNoteCandidates', id: arg.creditNoteId },
      ],
    }),
    requestBillingCreditNotePdf: build.mutation<
      BillingCreditNotePdfJobResponse,
      { creditNoteId: string }
    >({
      query: ({ creditNoteId }) => ({
        url: `/billing/b2b/credit-notes/${encodeURIComponent(creditNoteId)}/pdf`,
        method: 'POST',
      }),
      transformResponse: (raw: unknown) => parsePdfJobResponse(raw),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'BillingCreditNotePdfStatus', id: arg.creditNoteId },
      ],
    }),
    getBillingCreditNotePdfStatus: build.query<
      BillingCreditNotePdfStatusResponse,
      { creditNoteId: string }
    >({
      query: ({ creditNoteId }) =>
        `/billing/b2b/credit-notes/${encodeURIComponent(creditNoteId)}/pdf`,
      transformResponse: (raw: unknown) => parsePdfStatusResponse(raw),
      providesTags: (_result, _error, arg) => [
        { type: 'BillingCreditNotePdfStatus', id: arg.creditNoteId },
      ],
    }),
    getBillingCreditNotePdfSignedUrl: build.mutation<
      BillingCreditNotePdfSignedUrlResponse,
      RequestBillingCreditNoteSignedUrlArgs
    >({
      query: ({ creditNoteId, disposition }) => ({
        url: `/billing/b2b/credit-notes/${encodeURIComponent(creditNoteId)}/pdf/signed-url`,
        method: 'POST',
        body: { disposition },
      }),
      transformResponse: (raw: unknown) => parsePdfSignedUrlResponse(raw),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetBillingCreditNotesQuery,
  useGetBillingCreditNoteDetailQuery,
  useGetBillingCreditNoteInvoiceCandidatesQuery,
  useApplyBillingCreditNoteMutation,
  useRequestBillingCreditNotePdfMutation,
  useGetBillingCreditNotePdfStatusQuery,
  useGetBillingCreditNotePdfSignedUrlMutation,
} = creditNotesApi;
