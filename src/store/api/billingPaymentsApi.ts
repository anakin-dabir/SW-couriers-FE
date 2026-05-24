import { baseApi } from '@/store/api/baseApi';

/** Payment status filter values (query: status[]) for history and KPIs */
export const BILLING_PAYMENT_HISTORY_STATUSES = [
  'DEPOSITED',
  'NOT_DEPOSITED',
  'PENDING',
  'WITHHELD_RETURNED',
  'VOIDED',
] as const;

export type BillingPaymentHistoryStatus = (typeof BILLING_PAYMENT_HISTORY_STATUSES)[number];

/** Allocation status filter values (query: allocation_status[]) */
export const BILLING_PAYMENT_ALLOCATION_STATUSES = [
  'ALLOCATED',
  'PARTIALLY_ALLOCATED',
  'UNALLOCATED',
] as const;

export type BillingPaymentHistoryAllocationStatus =
  (typeof BILLING_PAYMENT_ALLOCATION_STATUSES)[number];

/** Provider filter values (query: provider[]) */
export const BILLING_PAYMENT_HISTORY_PROVIDERS = ['BRAINTREE'] as const;

export type BillingPaymentHistoryProvider = (typeof BILLING_PAYMENT_HISTORY_PROVIDERS)[number];

export function normalizeBillingPaymentHistoryStatus(status: string): BillingPaymentHistoryStatus {
  const upper = status.toUpperCase();
  if ((BILLING_PAYMENT_HISTORY_STATUSES as readonly string[]).includes(upper)) {
    return upper as BillingPaymentHistoryStatus;
  }
  if (upper === 'COMPLETED' || upper === 'SETTLED' || upper === 'CAPTURED') return 'DEPOSITED';
  if (upper === 'PROCESSING' || upper === 'AUTHORIZED') return 'PENDING';
  if (upper === 'FAILED' || upper === 'DECLINED') return 'PENDING';
  if (upper === 'REVERSED') return 'WITHHELD_RETURNED';
  return 'PENDING';
}

export function normalizeBillingPaymentAllocationStatus(
  status: string
): BillingPaymentHistoryAllocationStatus {
  const upper = status.toUpperCase();
  if ((BILLING_PAYMENT_ALLOCATION_STATUSES as readonly string[]).includes(upper)) {
    return upper as BillingPaymentHistoryAllocationStatus;
  }
  if (upper === 'FULLY_ALLOCATED' || upper === 'FULL') return 'ALLOCATED';
  if (upper === 'PARTIAL') return 'PARTIALLY_ALLOCATED';
  if (upper === 'NONE') return 'UNALLOCATED';
  return 'UNALLOCATED';
}

export interface GetBillingPaymentsHistoryArgs {
  organization_id?: string;
  page?: number;
  size?: number;
  search?: string;
  payment_date_from?: string;
  payment_date_to?: string;
  status?: string[];
  allocation_status?: string[];
  provider?: string[];
}

export interface GetBillingPaymentKpisArgs {
  organization_id?: string;
  payment_date_from?: string;
  payment_date_to?: string;
  status?: string[];
  allocation_status?: string[];
  provider?: string[];
}

export interface GetBillingPaymentByIdArgs {
  paymentId: string;
  organization_id?: string;
}

export interface BillingPaymentRemittanceAdvice {
  content_type: string | null;
  original_filename: string | null;
  size_bytes: number | null;
  uploaded_at: string | null;
}

export interface BillingPaymentListItem {
  id: string;
  payment_number: string;
  payment_date: string;
  amount: string;
  currency: string | null;
  status: string;
  allocation_status: string;
  provider: string;
  bank_reference: string | null;
  recorded_by: string | null;
  allocated_to_summary: string | null;
  remaining_summary: string | null;
  unallocated_amount: string | null;
  allocated_amount: string | null;
  /** Present when the history API embeds per-invoice allocation lines. */
  allocations: BillingPaymentAllocationLine[];
}

export interface BillingPaymentsHistoryResponse {
  items: BillingPaymentListItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/** One invoice allocation line from GET /billing/payments/{id} (contract + optional denormalized fields). */
export interface BillingPaymentAllocationLine {
  invoice_id: string;
  revision_no: number | null;
  allocated_amount: string;
  notes: string | null;
  created_at: string;
  invoice_number: string | null;
  invoice_date: string | null;
  invoice_total: string | null;
  remaining_amount: string | null;
  line_status: string | null;
}

export interface BillingPaymentDetail {
  id: string;
  payment_number: string;
  organization_id: string | null;
  payment_date: string;
  amount: string;
  currency: string | null;
  status: string;
  allocation_status: string;
  provider: string;
  bank_reference: string | null;
  recorded_by: string | null;
  recorded_by_id: string | null;
  notes: string | null;
  allocated_amount: string | null;
  unallocated_amount: string | null;
  qb_sync_status: string | null;
  version: number | null;
  created_at: string | null;
  updated_at: string | null;
  remittance_advice: BillingPaymentRemittanceAdvice | null;
  allocations: BillingPaymentAllocationLine[];
}

/** KPIs for payment history cards; parser maps API fields (e.g. total_received, allocated). */
export interface BillingPaymentKpis {
  /** Maps API `total_received` when present */
  total_payments_amount: string;
  /** Maps API `allocated` when present */
  allocated_amount: string;
  /** Maps API `unallocated` when present */
  unallocated_amount: string;
  /** Maps API `pending` when present */
  pending_amount: string;
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

function parsePaginatedMeta(
  data: Record<string, unknown>,
  scope: string
): { total: number; page: number; size: number; pages: number } {
  return {
    total: assertNumber(data.total, `${scope}: data.total`),
    page: assertNumber(data.page, `${scope}: data.page`),
    size: assertNumber(data.size, `${scope}: data.size`),
    pages: assertNumber(data.pages, `${scope}: data.pages`),
  };
}

function formatAllocationMoney(amount: string, currency: string): string {
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) return amount;
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return amount;
  }
}

function allocationInvoiceLabel(allocation: BillingPaymentAllocationLine): string {
  const number = allocation.invoice_number?.trim();
  if (number) return number;
  const id = allocation.invoice_id;
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

/** Builds the payment-history "Allocated To" column from embedded allocation lines. */
export function buildBillingPaymentAllocatedToSummary(
  allocations: ReadonlyArray<BillingPaymentAllocationLine>,
  currency = 'GBP'
): string {
  if (!allocations.length) return '';
  return allocations
    .map((line) => {
      const label = allocationInvoiceLabel(line);
      const amount = line.allocated_amount?.trim();
      return amount ? `${label} (${formatAllocationMoney(amount, currency)})` : label;
    })
    .join('\n');
}

function parsePaymentAllocationsArray(
  row: Record<string, unknown>
): BillingPaymentAllocationLine[] {
  const candidates = [
    row.allocations,
    row.allocation_lines,
    row.allocated_invoices,
    row.invoice_allocations,
  ];
  for (const candidate of candidates) {
    if (!Array.isArray(candidate) || candidate.length === 0) continue;
    return candidate.map((line, i) => parseAllocationLine(line, i));
  }
  return [];
}

function parseAllocatedToSummaryField(row: Record<string, unknown>): string | null {
  const raw =
    row.allocated_to_summary ??
    row.allocated_summary ??
    row.allocations_summary ??
    row.allocated_to;
  if (typeof raw === 'string' && raw.trim().length > 0) return raw.trim();
  if (!Array.isArray(raw)) return null;

  const parts = raw
    .map((entry) => {
      if (typeof entry === 'string' && entry.trim().length > 0) return entry.trim();
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return '';
      const o = entry as Record<string, unknown>;
      const invoiceNumber = asNullableString(o.invoice_number ?? o.invoiceNumber ?? o.number);
      const amountRaw = o.allocated_amount ?? o.amount ?? o.applied_amount;
      if (invoiceNumber && amountRaw != null) {
        const amount = stringifyMoneyField(amountRaw, '');
        return amount
          ? `${invoiceNumber} (${formatAllocationMoney(amount, 'GBP')})`
          : invoiceNumber;
      }
      return invoiceNumber ?? '';
    })
    .filter((part) => part.length > 0);

  return parts.length > 0 ? parts.join('\n') : null;
}

function resolveAllocatedToSummary(
  row: Record<string, unknown>,
  allocations: BillingPaymentAllocationLine[],
  currency: string | null
): string | null {
  const direct = parseAllocatedToSummaryField(row);
  if (direct) return direct;

  const fromAllocations = buildBillingPaymentAllocatedToSummary(allocations, currency ?? 'GBP');
  if (fromAllocations) return fromAllocations;

  const numbersRaw = row.allocated_invoice_numbers ?? row.invoice_numbers;
  if (!Array.isArray(numbersRaw)) return null;

  const numbers = numbersRaw
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim();
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        const o = entry as Record<string, unknown>;
        return asNullableString(o.invoice_number ?? o.invoiceNumber ?? o.number)?.trim() ?? '';
      }
      return '';
    })
    .filter((n) => n.length > 0);

  return numbers.length > 0 ? numbers.join('\n') : null;
}

function parseBillingPaymentListItem(raw: unknown, index: number): BillingPaymentListItem {
  const row = assertObject(
    raw,
    `Invalid billing payments history: data.items[${index}] is not an object`
  );
  const id = assertString(row.id, `Invalid billing payments history: data.items[${index}].id`);
  const currency = asNullableString(row.currency);
  const allocations = parsePaymentAllocationsArray(row);
  const allocated_to_summary = resolveAllocatedToSummary(row, allocations, currency);
  return {
    id,
    payment_number: asNullableString(row.payment_number) ?? id,
    payment_date: assertString(
      row.payment_date ?? row.payment_received_at ?? row.created_at,
      `Invalid billing payments history: data.items[${index}].payment_date`
    ),
    amount: assertString(
      row.amount ?? row.payment_amount ?? row.total_amount ?? '0',
      `Invalid billing payments history: data.items[${index}].amount`
    ),
    currency,
    status: assertString(
      row.status ?? 'UNKNOWN',
      `Invalid billing payments history: data.items[${index}].status`
    ),
    allocation_status: assertString(
      row.allocation_status ?? 'UNALLOCATED',
      `Invalid billing payments history: data.items[${index}].allocation_status`
    ),
    provider: assertString(
      row.provider ?? 'MANUAL',
      `Invalid billing payments history: data.items[${index}].provider`
    ),
    bank_reference: asNullableString(row.bank_reference ?? row.reference ?? row.transaction_id),
    recorded_by: asNullableString(row.recorded_by ?? row.recorded_by_name ?? row.created_by_name),
    allocated_to_summary,
    remaining_summary: asNullableString(
      row.remaining_summary ?? row.unallocated_display ?? row.remaining_display
    ),
    unallocated_amount: asNullableString(row.unallocated_amount ?? row.remaining_amount),
    allocated_amount: asNullableString(row.allocated_amount ?? row.total_allocated),
    allocations,
  };
}

function parseBillingPaymentsHistoryResponse(raw: unknown): BillingPaymentsHistoryResponse {
  const obj = assertObject(raw, 'Invalid billing payments history response');
  if (obj.success !== true) {
    throw new Error('Invalid billing payments history response: success is not true');
  }
  const data = assertObject(obj.data, 'Invalid billing payments history response: missing data');
  if (!Array.isArray(data.items)) {
    throw new Error('Invalid billing payments history response: data.items is not an array');
  }
  return {
    items: data.items.map((item, index) => parseBillingPaymentListItem(item, index)),
    ...parsePaginatedMeta(data, 'Invalid billing payments history response'),
  };
}

function parseOptionalInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number.parseInt(value, 10);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function parseRemittanceAdvice(raw: unknown): BillingPaymentRemittanceAdvice | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const size = r.size_bytes;
  let size_bytes: number | null = null;
  if (typeof size === 'number' && !Number.isNaN(size)) size_bytes = size;
  else if (typeof size === 'string' && size.trim() !== '') {
    const n = Number.parseInt(size, 10);
    size_bytes = Number.isNaN(n) ? null : n;
  }
  return {
    content_type: asNullableString(r.content_type),
    original_filename: asNullableString(r.original_filename),
    size_bytes,
    uploaded_at: asNullableString(r.uploaded_at),
  };
}

function stringifyMoneyField(value: unknown, fallback: string): string {
  if (typeof value === 'number' && !Number.isNaN(value)) return String(value);
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  return fallback;
}

function parseAllocationLine(raw: unknown, index: number): BillingPaymentAllocationLine {
  const row = assertObject(
    raw,
    `Invalid billing payment detail: allocations[${index}] is not an object`
  );
  const invoiceIdRaw = row.invoice_id ?? row.invoiceId;
  let invoice_id: string;
  if (typeof invoiceIdRaw === 'string' && invoiceIdRaw.trim().length > 0) {
    invoice_id = invoiceIdRaw.trim();
  } else if (typeof invoiceIdRaw === 'number' && !Number.isNaN(invoiceIdRaw)) {
    invoice_id = String(invoiceIdRaw);
  } else {
    invoice_id = `unknown-${index}`;
  }

  const allocated_amount = stringifyMoneyField(row.allocated_amount ?? row.allocated, '0');

  const createdRaw = row.created_at ?? row.createdAt;
  const created_at =
    typeof createdRaw === 'string'
      ? createdRaw
      : createdRaw != null && (typeof createdRaw === 'number' || typeof createdRaw === 'boolean')
        ? String(createdRaw)
        : '';

  const invTotal = row.invoice_total ?? row.total ?? row.invoice_amount;
  const remRaw =
    row.remaining_amount ?? row.invoice_remaining_amount ?? row.remaining ?? row.outstanding;

  return {
    invoice_id,
    revision_no: parseOptionalInt(row.revision_no ?? row.revisionNo),
    allocated_amount,
    notes: asNullableString(row.notes),
    created_at,
    invoice_number: asNullableString(row.invoice_number ?? row.invoiceNumber),
    invoice_date: asNullableString(
      typeof row.invoice_date === 'string'
        ? row.invoice_date
        : typeof row.invoice_issue_date === 'string'
          ? row.invoice_issue_date
          : typeof row.issue_date === 'string'
            ? row.issue_date
            : typeof row.invoiced_date === 'string'
              ? row.invoiced_date
              : null
    ),
    invoice_total:
      (row.invoice_total_amount ?? invTotal) == null
        ? null
        : stringifyMoneyField(row.invoice_total_amount ?? invTotal, '0'),
    remaining_amount: remRaw == null ? null : stringifyMoneyField(remRaw, '0'),
    line_status: asNullableString(row.status ?? row.line_status ?? row.allocation_line_status),
  };
}

function parseBillingPaymentDetailPayload(data: Record<string, unknown>): BillingPaymentDetail {
  const payment = data.payment && typeof data.payment === 'object' ? data.payment : data;
  const p = assertObject(payment, 'Invalid billing payment detail: payment payload');
  const id = assertString(p.id, 'Invalid billing payment detail: id');
  const allocationsRaw =
    (Array.isArray(data.allocations) ? data.allocations : null) ??
    (Array.isArray(p.allocations) ? p.allocations : null) ??
    (Array.isArray(data.allocation_lines) ? data.allocation_lines : null) ??
    [];
  return {
    id,
    payment_number: asNullableString(p.payment_number) ?? id,
    organization_id: asNullableString(p.organization_id),
    payment_date: assertString(
      p.payment_date ?? p.payment_received_at ?? p.created_at,
      'Invalid billing payment detail: payment_date'
    ),
    amount: assertString(
      p.amount ?? p.payment_amount ?? '0',
      'Invalid billing payment detail: amount'
    ),
    currency: asNullableString(p.currency),
    status: assertString(p.status ?? 'UNKNOWN', 'Invalid billing payment detail: status'),
    allocation_status: assertString(
      p.allocation_status ?? 'UNALLOCATED',
      'Invalid billing payment detail: allocation_status'
    ),
    provider: assertString(p.provider ?? 'MANUAL', 'Invalid billing payment detail: provider'),
    bank_reference: asNullableString(p.bank_reference ?? p.reference ?? p.transaction_id),
    recorded_by: asNullableString(p.recorded_by ?? p.recorded_by_name ?? p.created_by_name),
    recorded_by_id: asNullableString(p.recorded_by_id),
    notes: asNullableString(p.notes ?? p.internal_notes),
    allocated_amount: asNullableString(p.allocated_amount ?? p.total_allocated),
    unallocated_amount: asNullableString(p.unallocated_amount ?? p.remaining_amount),
    qb_sync_status: asNullableString(p.qb_sync_status),
    version: parseOptionalInt(p.version),
    created_at: asNullableString(p.created_at),
    updated_at: asNullableString(p.updated_at),
    remittance_advice: parseRemittanceAdvice(p.remittance_advice),
    allocations: (allocationsRaw as unknown[]).map((line, i) => parseAllocationLine(line, i)),
  };
}

function parseBillingPaymentDetailResponse(raw: unknown): BillingPaymentDetail {
  const obj = assertObject(raw, 'Invalid billing payment detail response');
  if (obj.success !== true) {
    throw new Error('Invalid billing payment detail response: success is not true');
  }
  const data = assertObject(obj.data, 'Invalid billing payment detail response: missing data');
  return parseBillingPaymentDetailPayload(data);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/** Money KPIs may be JSON numbers or strings; values may live on nested objects. */
function flattenKpiPayload(data: Record<string, unknown>): Record<string, unknown> {
  const merged: Record<string, unknown> = {};
  const nestKeys = ['kpis', 'summary', 'totals', 'payment_kpis', 'metrics'] as const;
  for (const k of nestKeys) {
    const inner = data[k];
    if (isRecord(inner)) {
      Object.assign(merged, inner);
    }
  }
  return { ...merged, ...data };
}

function pickFirstMoneyField(
  data: Record<string, unknown>,
  keys: readonly string[],
  fallback: string
): string {
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
    const v = data[key];
    if (typeof v === 'number' && !Number.isNaN(v)) return String(v);
    if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  }
  return fallback;
}

function parseBillingPaymentKpisResponse(raw: unknown): BillingPaymentKpis {
  const obj = assertObject(raw, 'Invalid billing payment KPIs response');
  if (obj.success === false) {
    throw new Error('Invalid billing payment KPIs response: success is false');
  }
  let dataRaw: Record<string, unknown>;
  if (obj.success === true) {
    dataRaw = assertObject(obj.data, 'Invalid billing payment KPIs response: missing data');
  } else if (isRecord(obj.data)) {
    dataRaw = obj.data;
  } else {
    dataRaw = obj;
  }
  const data = flattenKpiPayload(dataRaw);
  const zero = '0';
  return {
    total_payments_amount: pickFirstMoneyField(
      data,
      [
        'total_received',
        'total_payments_amount',
        'total_payment_amount',
        'total_amount',
        'total_payments',
        'payments_total',
        'totalPaymentsAmount',
        'totalPayments',
        'payment_total',
        'payments_sum',
        'sum_payments',
        'gross_payments',
      ],
      zero
    ),
    allocated_amount: pickFirstMoneyField(
      data,
      [
        'allocated',
        'allocated_amount',
        'total_allocated',
        'allocated_total',
        'totalAllocated',
        'allocatedAmount',
        'sum_allocated',
      ],
      zero
    ),
    unallocated_amount: pickFirstMoneyField(
      data,
      [
        'unallocated',
        'unallocated_amount',
        'total_unallocated',
        'unallocated_total',
        'unallocatedAmount',
        'on_account',
        'on_account_total',
      ],
      zero
    ),
    pending_amount: pickFirstMoneyField(
      data,
      [
        'pending',
        'pending_amount',
        'total_pending',
        'pending_total',
        'pendingAmount',
        'pending_payments',
        'sum_pending',
      ],
      zero
    ),
  };
}

function compactQueryParams<T extends object>(args: T): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(args as Record<string, unknown>)) {
    if (value == null) continue;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) params[key] = trimmed;
      continue;
    }
    if (Array.isArray(value)) {
      if (value.length > 0) params[key] = value;
      continue;
    }
    params[key] = value;
  }
  return params;
}

export const billingPaymentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBillingPaymentsHistory: build.query<
      BillingPaymentsHistoryResponse,
      GetBillingPaymentsHistoryArgs
    >({
      query: (args) => ({
        url: '/billing/payments/history',
        method: 'GET',
        params: compactQueryParams(args),
      }),
      transformResponse: (raw: unknown) => parseBillingPaymentsHistoryResponse(raw),
      providesTags: ['BillingPaymentHistory'],
    }),
    getBillingPaymentKpis: build.query<BillingPaymentKpis, GetBillingPaymentKpisArgs>({
      query: (args) => ({
        url: '/billing/payments/kpis',
        params: compactQueryParams(args),
      }),
      transformResponse: (raw: unknown) => parseBillingPaymentKpisResponse(raw),
      providesTags: ['BillingPaymentKpis'],
    }),
    getBillingPaymentById: build.query<BillingPaymentDetail, GetBillingPaymentByIdArgs>({
      query: ({ paymentId, organization_id }) => ({
        url: `/billing/payments/${encodeURIComponent(paymentId)}`,
        params: organization_id ? { organization_id } : undefined,
      }),
      transformResponse: (raw: unknown) => parseBillingPaymentDetailResponse(raw),
      providesTags: (_result, _error, arg) => [{ type: 'BillingPaymentDetail', id: arg.paymentId }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetBillingPaymentsHistoryQuery,
  useGetBillingPaymentKpisQuery,
  useGetBillingPaymentByIdQuery,
} = billingPaymentsApi;
