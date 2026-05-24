import { extractPdfDownloadUrl } from '@/lib/pdfDownload';
import { baseApi } from '@/store/api/baseApi';

export type AccountStatementPdfStatus = 'NOT_REQUESTED' | 'GENERATING' | 'READY' | 'FAILED';
export type AccountStatementLedgerRowType = 'INVOICE' | 'PAYMENT' | 'CREDIT_NOTE' | 'REFUND';

export interface AccountStatementAging {
  days_1_30: string;
  days_31_60: string;
  days_61_90: string;
  days_90_plus: string;
}

export interface AccountStatementProvider {
  name: string;
  address: string;
  email: string;
}

export interface AccountStatementLineItem {
  description: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface AccountStatementLedgerRow {
  row_type: AccountStatementLedgerRowType;
  reference_id: string;
  reference_number: string;
  issue_date: string;
  order_ref: string | null;
  payment_date: string | null;
  status: string;
  amount: string;
  balance: string;
  line_items: AccountStatementLineItem[];
}

export interface AccountStatementLedger {
  opening_balance: string;
  closing_balance: string;
  total_invoice_amount: string;
  total_paid: string;
  total_unpaid: string;
  total_overdue: string;
  aging: AccountStatementAging;
  currency: string;
  truncated: boolean;
  rows: AccountStatementLedgerRow[];
}

export interface AccountStatementListItem {
  id: string;
  statement_number: string;
  organization_id: string;
  period_start: string;
  period_end: string;
  opening_balance: string;
  closing_balance: string;
  pdf_status: string;
  created_at: string;
  created_by_user_type: string | null;
  generated_at: string | null;
}

export interface AccountStatementsListResponse {
  items: AccountStatementListItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface AccountStatementDetail {
  id: string;
  statement_number: string;
  organization_id: string;
  period_start: string;
  period_end: string;
  opening_balance: string;
  closing_balance: string;
  pdf_status: string;
  created_at: string;
  created_by_user_type: string | null;
  generated_at: string | null;
  total_invoice_amount: string;
  total_paid: string;
  total_unpaid: string;
  total_overdue: string;
  aging: AccountStatementAging;
  include_line_item_detail: boolean;
  include_credit_notes: boolean;
  include_payment_history: boolean;
  provider: AccountStatementProvider;
  client_name: string;
  client_address: string;
  client_email: string;
  snapshot: AccountStatementLedger;
}

export interface AccountStatementPreview {
  organization_id: string;
  period_start: string;
  period_end: string;
  provider: AccountStatementProvider;
  client_name: string;
  client_address: string;
  client_email: string;
  ledger: AccountStatementLedger;
}

export interface AccountStatementSummary {
  opening_balance: string;
  closing_balance: string;
  total_invoice_amount: string;
  total_paid: string;
  total_unpaid: string;
  total_overdue: string;
  aging: AccountStatementAging;
  currency: string;
  truncated: boolean;
}

export interface AccountStatementPdfStatusResponse {
  statement_id: string;
  status: string;
  job_id: string | null;
}

export interface AccountStatementPdfSignedUrlResponse {
  url: string;
  expires_at: string | null;
}

export interface GetAccountStatementsArgs {
  page?: number;
  size?: number;
  search?: string;
  period_start_from?: string;
  period_start_to?: string;
  generated_from?: string;
  generated_to?: string;
}

export interface AccountStatementPeriodQueryArgs {
  period_start: string;
  period_end: string;
  include_line_item_detail?: boolean;
  include_credit_notes?: boolean;
  include_payment_history?: boolean;
}

export interface GenerateAccountStatementArgs {
  period_start: string;
  period_end: string;
  include_line_item_detail?: boolean;
  include_credit_notes?: boolean;
  include_payment_history?: boolean;
  idempotencyKey?: string;
}

export interface GetAccountStatementPdfSignedUrlArgs {
  statementId: string;
  disposition?: 'inline' | 'attachment';
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

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function stringifyMoney(value: unknown, fallback = '0'): string {
  if (typeof value === 'number' && !Number.isNaN(value)) return String(value);
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  return fallback;
}

function parsePaginatedMeta(
  data: Record<string, unknown>,
  scope: string
): { total: number; page: number; size: number; pages: number } {
  const total = assertNumber(data.total, `${scope}: data.total`);
  const page = assertNumber(data.page, `${scope}: data.page`);
  const size = assertNumber(data.size, `${scope}: data.size`);
  const pagesRaw = data.pages;
  const pages =
    typeof pagesRaw === 'number' && !Number.isNaN(pagesRaw)
      ? Math.max(1, Math.trunc(pagesRaw))
      : Math.max(1, Math.ceil(total / Math.max(1, size)));
  return { total, page, size, pages };
}

function parseAging(raw: unknown): AccountStatementAging {
  const row =
    raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  return {
    days_1_30: stringifyMoney(row.days_1_30),
    days_31_60: stringifyMoney(row.days_31_60),
    days_61_90: stringifyMoney(row.days_61_90),
    days_90_plus: stringifyMoney(row.days_90_plus),
  };
}

function parseProvider(raw: unknown): AccountStatementProvider {
  const row =
    raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  return {
    name: asNullableString(row.name) ?? 'SW Couriers',
    address: asNullableString(row.address) ?? '',
    email: asNullableString(row.email) ?? '',
  };
}

function parseLineItemQuantity(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function parseLineItem(raw: unknown, index: number): AccountStatementLineItem {
  const row = assertObject(raw, `Invalid statement line item [${index}]`);
  return {
    description: asNullableString(row.description) ?? '',
    quantity: parseLineItemQuantity(row.quantity),
    unit_price: stringifyMoney(row.unit_price),
    total_price: stringifyMoney(row.total_price),
  };
}

function parseLedgerRow(raw: unknown, index: number): AccountStatementLedgerRow {
  const row = assertObject(raw, `Invalid statement ledger row [${index}]`);
  const rowTypeRaw = assertString(row.row_type ?? 'INVOICE', `ledger row [${index}].row_type`);
  const row_type = rowTypeRaw.toUpperCase() as AccountStatementLedgerRowType;
  const lineItemsRaw = Array.isArray(row.line_items) ? row.line_items : [];
  return {
    row_type,
    reference_id: assertString(row.reference_id ?? row.referenceId ?? `row-${index}`, ''),
    reference_number: asNullableString(row.reference_number ?? row.referenceNumber) ?? '-',
    issue_date: asNullableString(row.issue_date ?? row.issueDate) ?? '',
    order_ref: asNullableString(row.order_ref ?? row.orderRef),
    payment_date: asNullableString(row.payment_date ?? row.paymentDate),
    status: asNullableString(row.status) ?? '',
    amount: stringifyMoney(row.amount),
    balance: stringifyMoney(row.balance),
    line_items: lineItemsRaw.map((item, i) => parseLineItem(item, i)),
  };
}

function parseLedger(raw: unknown): AccountStatementLedger {
  const row =
    raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const rowsRaw = Array.isArray(row.rows) ? row.rows : [];
  return {
    opening_balance: stringifyMoney(row.opening_balance),
    closing_balance: stringifyMoney(row.closing_balance),
    total_invoice_amount: stringifyMoney(row.total_invoice_amount),
    total_paid: stringifyMoney(row.total_paid),
    total_unpaid: stringifyMoney(row.total_unpaid),
    total_overdue: stringifyMoney(row.total_overdue),
    aging: parseAging(row.aging),
    currency: asNullableString(row.currency) ?? 'GBP',
    truncated: asBoolean(row.truncated, false),
    rows: rowsRaw.map((item, index) => parseLedgerRow(item, index)),
  };
}

function parseListItem(raw: unknown, index: number): AccountStatementListItem {
  const row = assertObject(raw, `Invalid account statements list item [${index}]`);
  return {
    id: assertString(row.id, `items[${index}].id`),
    statement_number: asNullableString(row.statement_number) ?? assertString(row.id, ''),
    organization_id: asNullableString(row.organization_id) ?? '',
    period_start: assertString(row.period_start, `items[${index}].period_start`),
    period_end: assertString(row.period_end, `items[${index}].period_end`),
    opening_balance: stringifyMoney(row.opening_balance),
    closing_balance: stringifyMoney(row.closing_balance),
    pdf_status: asNullableString(row.pdf_status) ?? 'NOT_REQUESTED',
    created_at: assertString(row.created_at, `items[${index}].created_at`),
    created_by_user_type: asNullableString(row.created_by_user_type),
    generated_at: asNullableString(row.generated_at),
  };
}

function parseListResponse(raw: unknown): AccountStatementsListResponse {
  const obj = assertObject(raw, 'Invalid account statements list response');
  if (obj.success !== true) throw new Error('Invalid account statements list response');
  const data = assertObject(obj.data, 'Invalid account statements list response: missing data');
  if (!Array.isArray(data.items)) throw new Error('Invalid account statements list: items');
  return {
    items: data.items.map((item, index) => parseListItem(item, index)),
    ...parsePaginatedMeta(data, 'Invalid account statements list'),
  };
}

function parseDetail(raw: unknown): AccountStatementDetail {
  const obj = assertObject(raw, 'Invalid account statement detail response');
  if (obj.success !== true) throw new Error('Invalid account statement detail response');
  const row = assertObject(obj.data, 'Invalid account statement detail: missing data');
  const snapshot = parseLedger(row.snapshot ?? row.ledger);
  return {
    id: assertString(row.id, 'detail.id'),
    statement_number: asNullableString(row.statement_number) ?? assertString(row.id, ''),
    organization_id: assertString(row.organization_id ?? '', 'detail.organization_id'),
    period_start: assertString(row.period_start, 'detail.period_start'),
    period_end: assertString(row.period_end, 'detail.period_end'),
    opening_balance: stringifyMoney(row.opening_balance ?? snapshot.opening_balance),
    closing_balance: stringifyMoney(row.closing_balance ?? snapshot.closing_balance),
    pdf_status: asNullableString(row.pdf_status) ?? 'NOT_REQUESTED',
    created_at: assertString(row.created_at, 'detail.created_at'),
    created_by_user_type: asNullableString(row.created_by_user_type),
    generated_at: asNullableString(row.generated_at),
    total_invoice_amount: stringifyMoney(row.total_invoice_amount ?? snapshot.total_invoice_amount),
    total_paid: stringifyMoney(row.total_paid ?? snapshot.total_paid),
    total_unpaid: stringifyMoney(row.total_unpaid ?? snapshot.total_unpaid),
    total_overdue: stringifyMoney(row.total_overdue ?? snapshot.total_overdue),
    aging: parseAging(row.aging ?? snapshot.aging),
    include_line_item_detail: asBoolean(row.include_line_item_detail, false),
    include_credit_notes: asBoolean(row.include_credit_notes, true),
    include_payment_history: asBoolean(row.include_payment_history, true),
    provider: parseProvider(row.provider),
    client_name: asNullableString(row.client_name) ?? '',
    client_address: asNullableString(row.client_address) ?? '',
    client_email: asNullableString(row.client_email) ?? '',
    snapshot,
  };
}

function parsePreview(raw: unknown): AccountStatementPreview {
  const obj = assertObject(raw, 'Invalid account statement preview response');
  if (obj.success !== true) throw new Error('Invalid account statement preview response');
  const row = assertObject(obj.data, 'Invalid account statement preview: missing data');
  return {
    organization_id: assertString(row.organization_id ?? '', 'preview.organization_id'),
    period_start: assertString(row.period_start, 'preview.period_start'),
    period_end: assertString(row.period_end, 'preview.period_end'),
    provider: parseProvider(row.provider),
    client_name: asNullableString(row.client_name) ?? '',
    client_address: asNullableString(row.client_address) ?? '',
    client_email: asNullableString(row.client_email) ?? '',
    ledger: parseLedger(row.ledger),
  };
}

function parseSummary(raw: unknown): AccountStatementSummary {
  const obj = assertObject(raw, 'Invalid account statement summary response');
  if (obj.success !== true) throw new Error('Invalid account statement summary response');
  const row = assertObject(obj.data, 'Invalid account statement summary: missing data');
  return {
    opening_balance: stringifyMoney(row.opening_balance),
    closing_balance: stringifyMoney(row.closing_balance),
    total_invoice_amount: stringifyMoney(row.total_invoice_amount),
    total_paid: stringifyMoney(row.total_paid),
    total_unpaid: stringifyMoney(row.total_unpaid),
    total_overdue: stringifyMoney(row.total_overdue),
    aging: parseAging(row.aging),
    currency: asNullableString(row.currency) ?? 'GBP',
    truncated: asBoolean(row.truncated, false),
  };
}

function parsePdfStatus(raw: unknown): AccountStatementPdfStatusResponse {
  const obj = assertObject(raw, 'Invalid account statement PDF status response');
  if (obj.success !== true) throw new Error('Invalid account statement PDF status response');
  const row = assertObject(obj.data, 'Invalid account statement PDF status: missing data');
  return {
    statement_id: assertString(row.statement_id ?? row.id ?? '', 'pdf status statement_id'),
    status: assertString(row.status, 'pdf status.status'),
    job_id: asNullableString(row.job_id),
  };
}

function parsePdfSignedUrl(raw: unknown): AccountStatementPdfSignedUrlResponse {
  const obj = assertObject(raw, 'Invalid account statement PDF signed URL response');
  if (obj.success !== true) throw new Error('Invalid account statement PDF signed URL response');
  const row = assertObject(obj.data, 'Invalid account statement PDF signed URL: missing data');
  const url = extractPdfDownloadUrl(row);
  if (!url) throw new Error('Invalid account statement PDF signed URL: missing url');
  return { url, expires_at: asNullableString(row.expires_at) };
}

export const accountStatementsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAccountStatements: build.query<AccountStatementsListResponse, GetAccountStatementsArgs>({
      query: (args) => ({
        url: '/billing/b2b/account-statements',
        params: args,
      }),
      transformResponse: (raw: unknown) => parseListResponse(raw),
      providesTags: ['AccountStatementList'],
    }),
    getAccountStatementDetail: build.query<AccountStatementDetail, { statementId: string }>({
      query: ({ statementId }) =>
        `/billing/b2b/account-statements/${encodeURIComponent(statementId)}`,
      transformResponse: (raw: unknown) => parseDetail(raw),
      providesTags: (_result, _error, arg) => [
        { type: 'AccountStatementDetail', id: arg.statementId },
      ],
    }),
    getAccountStatementPreview: build.query<
      AccountStatementPreview,
      AccountStatementPeriodQueryArgs
    >({
      query: (args) => ({
        url: '/billing/b2b/account-statements/preview',
        params: args,
      }),
      transformResponse: (raw: unknown) => parsePreview(raw),
    }),
    getAccountStatementSummary: build.query<
      AccountStatementSummary,
      AccountStatementPeriodQueryArgs
    >({
      query: (args) => ({
        url: '/billing/b2b/account-statements/summary',
        params: args,
      }),
      transformResponse: (raw: unknown) => parseSummary(raw),
    }),
    generateAccountStatement: build.mutation<AccountStatementDetail, GenerateAccountStatementArgs>({
      query: ({ idempotencyKey, ...body }) => ({
        url: '/billing/b2b/account-statements',
        method: 'POST',
        body,
        headers: idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : undefined,
      }),
      transformResponse: (raw: unknown) => parseDetail(raw),
      invalidatesTags: ['AccountStatementList'],
    }),
    requestAccountStatementPdf: build.mutation<
      AccountStatementPdfStatusResponse,
      { statementId: string }
    >({
      query: ({ statementId }) => ({
        url: `/billing/b2b/account-statements/${encodeURIComponent(statementId)}/pdf`,
        method: 'POST',
      }),
      transformResponse: (raw: unknown) => parsePdfStatus(raw),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'AccountStatementPdfStatus', id: arg.statementId },
      ],
    }),
    getAccountStatementPdfStatus: build.query<
      AccountStatementPdfStatusResponse,
      { statementId: string }
    >({
      query: ({ statementId }) =>
        `/billing/b2b/account-statements/${encodeURIComponent(statementId)}/pdf/status`,
      transformResponse: (raw: unknown) => parsePdfStatus(raw),
      providesTags: (_result, _error, arg) => [
        { type: 'AccountStatementPdfStatus', id: arg.statementId },
      ],
    }),
    getAccountStatementPdfSignedUrl: build.mutation<
      AccountStatementPdfSignedUrlResponse,
      GetAccountStatementPdfSignedUrlArgs
    >({
      query: ({ statementId, disposition = 'attachment' }) => ({
        url: `/billing/b2b/account-statements/${encodeURIComponent(statementId)}/pdf/signed-url`,
        method: 'POST',
        body: { disposition },
      }),
      transformResponse: (raw: unknown) => parsePdfSignedUrl(raw),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAccountStatementsQuery,
  useGetAccountStatementDetailQuery,
  useGetAccountStatementPreviewQuery,
  useGetAccountStatementSummaryQuery,
  useGenerateAccountStatementMutation,
  useRequestAccountStatementPdfMutation,
  useGetAccountStatementPdfStatusQuery,
  useGetAccountStatementPdfSignedUrlMutation,
} = accountStatementsApi;
