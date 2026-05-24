import * as React from 'react';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  ArrowLeft,
  ArrowUpRight,
  AlertTriangle,
  Ban,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  EllipsisVertical,
  Hash,
  Info,
  Loader2,
  ReceiptText,
  UserRound,
  RefreshCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { endOfDay, format, parseISO, startOfDay, subDays } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { Input } from '@/components/atoms/input';
import { Badge } from '@/components/atoms/badge';
import { Calendar } from '@/components/atoms/calendar';
import { Checkbox } from '@/components/atoms/checkbox';
import { Switch } from '@/components/atoms/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { Card, CardContent } from '@/components/atoms/card';
import { Pagination } from '@/components/molecules';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import { openPdfDownloadUrl } from '@/lib/pdfDownload';
import { cn } from '@/lib/utils';
import { AccountStatementGeneratePreview } from '@/components/pages/Billing/AccountStatementGeneratePreview';
import { AccountStatementDetailOverlay } from '@/components/pages/Billing/AccountStatementDetailOverlay';
import {
  BillingInvoiceOverdueIcon,
  BillingInvoiceTotalInvoicesIcon,
  BillingInvoiceTotalPaidIcon,
  BillingInvoiceTotalUnpaidIcon,
  BillingPaymentAllocatedIcon,
  BillingPaymentPendingIcon,
  BillingPaymentTotalPaymentsIcon,
  BillingPaymentUnallocatedIcon,
  BillingRefundTotalAmountIcon,
  NoInvoicesYetIllustration,
  NoPaymentHistoryIllustration,
} from '@/assets/svg';
import {
  BILLING_CREDIT_NOTE_FILTER_REASON_CATEGORIES,
  BILLING_CREDIT_NOTE_FILTER_STATUSES,
  INVOICE_FILTER_PAYMENT_STATUSES,
  INVOICE_FILTER_STATUSES,
  BILLING_REFUND_FILTER_METHODS,
  BILLING_REFUND_FILTER_REASON_CATEGORIES,
  BILLING_REFUND_FILTER_STATUSES,
  BILLING_REFUND_FILTER_TYPES,
  useGetInvoicesQuery,
  useGetInvoicesSummaryQuery,
  useGetBillingCreditNoteDetailQuery,
  useGetBillingCreditNoteInvoiceCandidatesQuery,
  useGetBillingCreditNotePdfSignedUrlMutation,
  useGetBillingCreditNotePdfStatusQuery,
  useRequestBillingCreditNotePdfMutation,
  useApplyBillingCreditNoteMutation,
  useGetBillingCreditNotesQuery,
  useGetBillingRefundDetailQuery,
  useGetBillingRefundKpisQuery,
  useGetBillingRefundsQuery,
  useGetBillingPaymentByIdQuery,
  useGetBillingPaymentKpisQuery,
  useGetBillingPaymentsHistoryQuery,
  buildBillingPaymentAllocatedToSummary,
  BILLING_PAYMENT_HISTORY_STATUSES,
  BILLING_PAYMENT_ALLOCATION_STATUSES,
  BILLING_PAYMENT_HISTORY_PROVIDERS,
  normalizeBillingPaymentHistoryStatus,
  normalizeBillingPaymentAllocationStatus,
  type BillingPaymentHistoryStatus,
  type BillingPaymentHistoryAllocationStatus,
  type BillingPaymentHistoryProvider,
  useGetAccountStatementsQuery,
  useGetAccountStatementDetailQuery,
  useGetAccountStatementPreviewQuery,
  useGetAccountStatementSummaryQuery,
  useGenerateAccountStatementMutation,
  useRequestAccountStatementPdfMutation,
  useGetAccountStatementPdfStatusQuery,
  useGetAccountStatementPdfSignedUrlMutation,
  type AccountStatementDetail,
  type AccountStatementPeriodQueryArgs,
  type AccountStatementPreview,
  type AccountStatementSummary,
  type BillingCreditNoteListItem,
  type BillingCreditNoteReasonCategory,
  type BillingCreditNoteStatus,
  type BillingCreditNoteSortBy,
  type InvoiceLifecycleStatus,
  type InvoicePaymentStatus,
  type InvoiceListItem,
  type InvoiceSummaryResponse,
  type BillingSortOrder,
  type BillingRefundKpis,
  type BillingRefundListItem,
  type BillingRefundMethod,
  type BillingRefundReasonCategory,
  type BillingRefundStatus,
  type BillingRefundType,
  type BillingPaymentDetail,
  type BillingPaymentListItem,
  type BillingPaymentAllocationLine,
} from '@/store/api';
import type { RootState } from '@/store/store';

type BillingSection = 'invoices' | 'payment-details' | 'statements' | 'credit-notes' | 'refunds';

interface SectionMeta {
  title: string;
  subtitle: string;
}

const SECTION_META: Record<BillingSection, SectionMeta> = {
  invoices: { title: 'Invoices', subtitle: 'Track all issued invoices and payment status.' },
  'payment-details': {
    title: 'Payment History',
    subtitle: 'Track all your payments and invoice allocations.',
  },
  statements: {
    title: 'Account Statements',
    subtitle: 'Generate and download client account statements.',
  },
  'credit-notes': { title: 'Credit Notes', subtitle: 'Manage and apply credit notes to invoices' },
  refunds: { title: 'Refunds', subtitle: 'View all your refunds' },
};

const REFUND_STATS_META = [
  {
    key: 'total_refund_amount',
    label: 'Total Refund Amount',
    tone: 'default',
    iconSrc: BillingRefundTotalAmountIcon,
  },
  {
    key: 'refunds_this_month',
    label: 'Refunds This Month',
    tone: 'default',
    icon: RefreshCcw,
    iconClass: 'text-[#22C55E]',
  },
  {
    key: 'pending_refunds',
    label: 'Pending Refunds',
    tone: 'default',
    icon: Clock3,
    iconClass: 'text-[#F59E0B]',
  },
  {
    key: 'failed_refunds',
    label: 'Failed Refunds',
    tone: 'danger',
    icon: AlertTriangle,
    iconClass: 'text-[#DC2626]',
  },
  {
    key: 'avg_refund_time_days',
    label: 'Avg. Refund Time',
    tone: 'default',
    icon: Clock3,
    iconClass: 'text-[#22C55E]',
  },
] as const;

const INVOICE_STATS_META = [
  {
    key: 'total_invoices',
    label: 'Total Invoices',
    tone: 'default',
    iconSrc: BillingInvoiceTotalInvoicesIcon,
  },
  {
    key: 'total_paid',
    label: 'Total Paid',
    tone: 'default',
    iconSrc: BillingInvoiceTotalPaidIcon,
  },
  {
    key: 'total_unpaid',
    label: 'Total Unpaid',
    tone: 'default',
    iconSrc: BillingInvoiceTotalUnpaidIcon,
  },
  {
    key: 'overdue',
    label: 'Overdue',
    tone: 'danger',
    iconSrc: BillingInvoiceOverdueIcon,
  },
] as const;

const REFUND_STATUS_LABELS: Record<BillingRefundStatus, string> = {
  INITIATED: 'Initiated',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REVERSED: 'Reversed',
};

const REFUND_TYPE_LABELS: Record<BillingRefundType, string> = {
  FULL: 'Full Refund',
  PARTIAL: 'Partial Refund',
};

const REFUND_METHOD_LABELS: Record<BillingRefundMethod, string> = {
  CARD_REFUND: 'Card Refund',
  BANK_TRANSFER: 'Bank Transfer',
  CREDIT_NOTE: 'Credit Note',
};

const REFUND_REASON_CATEGORY_LABELS: Record<BillingRefundReasonCategory, string> = {
  BOOKING_CANCELLED: 'Booking Cancelled',
  SERVICE_FAILURE: 'Service Failure',
  DUPLICATE_PAYMENT: 'Duplicate Payment',
  BILLING_ERROR: 'Billing Error',
  CLIENT_REQUEST: 'Client Request',
  VOIDED_INVOICE: 'Voided Invoice',
  OTHER: 'Other',
};

const CREDIT_NOTE_STATUS_LABELS: Record<BillingCreditNoteStatus, string> = {
  OPEN: 'Open',
  PARTIALLY_APPLIED: 'Partially Applied',
  FULLY_APPLIED: 'Fully Applied',
  VOID: 'Void',
};

const CREDIT_NOTE_REASON_CATEGORY_LABELS: Record<BillingCreditNoteReasonCategory, string> = {
  BILLING_ERROR: 'Billing Error',
  SERVICE_FAILURE: 'Service Failure',
  CLIENT_REQUEST: 'Client Request',
  OTHER: 'Other',
};

const CREDIT_NOTE_STATUS_BADGE_CLASS: Record<BillingCreditNoteStatus, string> = {
  OPEN: 'bg-[#10B981] text-white',
  PARTIALLY_APPLIED: 'bg-[#F59E0B] text-white',
  FULLY_APPLIED: 'bg-[#3B82F6] text-white',
  VOID: 'bg-[#9CA3AF] text-white',
};

const CREDIT_NOTE_REASON_BADGE_CLASS: Record<BillingCreditNoteReasonCategory, string> = {
  BILLING_ERROR: 'bg-[#EF4444] text-white',
  SERVICE_FAILURE: 'bg-[#F59E0B] text-white',
  CLIENT_REQUEST: 'bg-[#14B8A6] text-white',
  OTHER: 'bg-[#3B82F6] text-white',
};

const INVOICE_STATUS_LABELS: Record<InvoiceLifecycleStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
};

const INVOICE_PAYMENT_STATUS_LABELS: Record<InvoicePaymentStatus, string> = {
  UNPAID: 'Unpaid',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  VOID: 'Void',
  WRITTEN_OFF: 'Written Off',
  REFUNDED: 'Refunded',
  DISPUTED: 'Disputed',
};

type PaymentHistoryMethod = 'Card Payment' | 'Bank Transfer' | 'Cash';

const PAYMENT_HISTORY_STATUS_LABELS: Record<BillingPaymentHistoryStatus, string> = {
  DEPOSITED: 'Deposited',
  NOT_DEPOSITED: 'Not Deposited',
  PENDING: 'Pending',
  WITHHELD_RETURNED: 'Withheld Returned',
  VOIDED: 'Voided',
};

const PAYMENT_ALLOCATION_STATUS_LABELS: Record<BillingPaymentHistoryAllocationStatus, string> = {
  ALLOCATED: 'Allocated',
  PARTIALLY_ALLOCATED: 'Partially Allocated',
  UNALLOCATED: 'Unallocated',
};

const PAYMENT_PROVIDER_LABELS: Record<BillingPaymentHistoryProvider, string> = {
  BRAINTREE: 'Braintree',
};

interface PaymentHistoryAllocationRow {
  rowKey: string;
  invoiceLabel: string;
  totalDisplay: string;
  allocated: string;
  remainingDisplay: string;
  revisionDisplay: string;
  recordedOn: string;
  notesLine: string;
}

interface PaymentHistoryRow {
  id: string;
  paymentId: string;
  paymentDate: string;
  paymentMethod: PaymentHistoryMethod;
  amount: string;
  status: BillingPaymentHistoryStatus;
  allocatedTo: string;
  remaining: string;
  allocationStatus: BillingPaymentHistoryAllocationStatus;
  bankReference: string;
  recordedBy?: string;
  warning?: { tone: 'danger' | 'neutral'; title: string; message: string };
  allocationBreakdown: PaymentHistoryAllocationRow[];
}

interface PaymentHistoryFilterState {
  providers: BillingPaymentHistoryProvider[];
  statuses: BillingPaymentHistoryStatus[];
  allocationStatuses: BillingPaymentHistoryAllocationStatus[];
}

const EMPTY_PAYMENT_HISTORY_FILTERS: PaymentHistoryFilterState = {
  providers: [],
  statuses: [],
  allocationStatuses: [],
};

const PAYMENT_HISTORY_FILTER_STATUS_OPTIONS = BILLING_PAYMENT_HISTORY_STATUSES.map((value) => ({
  value,
  label: PAYMENT_HISTORY_STATUS_LABELS[value],
}));

const PAYMENT_HISTORY_FILTER_ALLOCATION_OPTIONS = BILLING_PAYMENT_ALLOCATION_STATUSES.map(
  (value) => ({
    value,
    label: PAYMENT_ALLOCATION_STATUS_LABELS[value],
  })
);

const PAYMENT_HISTORY_FILTER_PROVIDER_OPTIONS = BILLING_PAYMENT_HISTORY_PROVIDERS.map((value) => ({
  value,
  label: PAYMENT_PROVIDER_LABELS[value],
}));

type PaymentHistoryDatePresetId = 'all' | '7d' | '14d' | '30d';

const PAYMENT_HISTORY_DATE_QUICK_OPTIONS: ReadonlyArray<{
  id: PaymentHistoryDatePresetId;
  label: string;
  days?: number;
}> = [
  { id: 'all', label: 'All time' },
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '14d', label: 'Last 14 days', days: 14 },
  { id: '30d', label: 'Last 30 days', days: 30 },
];

type StatementListDatePresetId = 'all' | '7d' | '30d';

const STATEMENT_LIST_DATE_QUICK_OPTIONS: ReadonlyArray<{
  id: StatementListDatePresetId;
  label: string;
  days?: number;
}> = [
  { id: 'all', label: 'Any Date' },
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '30d', label: 'Last 30 Days', days: 30 },
];

interface StatementListRow {
  id: string;
  statementId: string;
  period: string;
  generatedOn: string;
  openingBalance: string;
  closingBalance: string;
}

function formatStatementPeriod(periodStart: string, periodEnd: string): string {
  try {
    const start = parseISO(periodStart.length >= 10 ? periodStart.slice(0, 10) : periodStart);
    const end = parseISO(periodEnd.length >= 10 ? periodEnd.slice(0, 10) : periodEnd);
    return `${format(start, 'd MMM')} - ${format(end, 'd MMM yyyy')}`;
  } catch {
    return `${periodStart} – ${periodEnd}`;
  }
}

/** Chip order + API values match billing contract (`statuses`, `refund_types`, …). */
const REFUND_FILTER_STATUS_OPTIONS = BILLING_REFUND_FILTER_STATUSES.map((value) => ({
  value,
  label: REFUND_STATUS_LABELS[value],
}));
const REFUND_FILTER_TYPE_OPTIONS = BILLING_REFUND_FILTER_TYPES.map((value) => ({
  value,
  label: REFUND_TYPE_LABELS[value],
}));
const REFUND_FILTER_METHOD_OPTIONS = BILLING_REFUND_FILTER_METHODS.map((value) => ({
  value,
  label: REFUND_METHOD_LABELS[value],
}));
const REFUND_FILTER_REASON_OPTIONS = BILLING_REFUND_FILTER_REASON_CATEGORIES.map((value) => ({
  value,
  label: REFUND_REASON_CATEGORY_LABELS[value],
}));
const CREDIT_NOTE_FILTER_STATUS_OPTIONS = BILLING_CREDIT_NOTE_FILTER_STATUSES.map((value) => ({
  value,
  label: CREDIT_NOTE_STATUS_LABELS[value],
}));
const CREDIT_NOTE_FILTER_REASON_OPTIONS = BILLING_CREDIT_NOTE_FILTER_REASON_CATEGORIES.map(
  (value) => ({
    value,
    label: CREDIT_NOTE_REASON_CATEGORY_LABELS[value],
  })
);

interface RefundFilterDraft {
  types: BillingRefundType[];
  methods: BillingRefundMethod[];
  statuses: BillingRefundStatus[];
  reasons: BillingRefundReasonCategory[];
}

interface CreditNoteFilterState {
  statuses: BillingCreditNoteStatus[];
  reasons: BillingCreditNoteReasonCategory[];
  sortBy: BillingCreditNoteSortBy;
  sortOrder: BillingSortOrder;
}

interface InvoiceFilterState {
  statuses: InvoiceLifecycleStatus[];
  paymentStatuses: InvoicePaymentStatus[];
  showDraft: boolean;
}

const EMPTY_REFUND_FILTER_DRAFT: RefundFilterDraft = {
  types: [],
  methods: [],
  statuses: [],
  reasons: [],
};

const EMPTY_CREDIT_NOTE_FILTER_STATE: CreditNoteFilterState = {
  statuses: [],
  reasons: [],
  sortBy: 'issue_date',
  sortOrder: 'desc',
};

const EMPTY_INVOICE_FILTER_STATE: InvoiceFilterState = {
  statuses: [],
  paymentStatuses: [],
  showDraft: false,
};

/** Matches billing filter row: h-10, light border, no heavy shadow */
const BILLING_TOOLBAR_TRIGGER_CLASS =
  'h-10 shrink-0 justify-between gap-2 rounded-md border border-[#E4E4E7] bg-white px-3 text-sm font-normal text-[#52525B] shadow-none hover:bg-[#FAFAFA]';

function getBadgeClass(value: string): string {
  const normalized = value.toLowerCase();
  if (
    normalized.includes('completed') ||
    normalized.includes('open') ||
    normalized.includes('full')
  ) {
    return 'bg-[#DCFCE7] text-[#16A34A]';
  }
  if (normalized.includes('processing') || normalized.includes('partially')) {
    return 'bg-[#F3E8FF] text-[#9333EA]';
  }
  if (normalized.includes('initiated') || normalized.includes('partial')) {
    return 'bg-[#DBEAFE] text-[#2563EB]';
  }
  if (normalized.includes('void')) {
    return 'bg-[#E4E4E7] text-[#71717A]';
  }
  if (normalized.includes('error') || normalized.includes('failed')) {
    return 'bg-[#FEE2E2] text-[#DC2626]';
  }
  if (normalized.includes('adjustment')) {
    return 'bg-[#CCFBF1] text-[#0F766E]';
  }
  return 'bg-[#F3F4F6] text-[#374151]';
}

function formatApiDate(value?: string | null): string {
  if (!value) return '-';
  try {
    return format(parseISO(value), 'dd MMM yyyy');
  } catch {
    return '-';
  }
}

function formatCurrencyAmount(amount: string, currency = 'GBP'): string {
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

function formatCreditCandidatePaymentStatus(status: string): string {
  return status.replaceAll('_', ' ').toLowerCase();
}

function formatCreditNoteApplicationsSummary(
  applications: ReadonlyArray<{ invoice_number: string; applied_amount: string }>,
  currency?: string | null
): string {
  if (!applications.length) return '';
  return applications
    .map(
      (a) => `${a.invoice_number} (${formatCurrencyAmount(a.applied_amount, currency ?? 'GBP')})`
    )
    .join(', ');
}

function formatCreditNoteAllocatedToListItem(
  item: BillingCreditNoteListItem,
  currency?: string | null
): string {
  const cur = currency ?? 'GBP';
  const apps = item.applications ?? [];
  const summaryFromApps = formatCreditNoteApplicationsSummary(apps, cur);
  if (summaryFromApps) return summaryFromApps;
  const applied = Number.parseFloat(item.applied_amount) || 0;
  if (item.source_invoice_number && applied > 0) {
    return `${item.source_invoice_number} (${formatCurrencyAmount(item.applied_amount, cur)})`;
  }
  if (applied > 0) return `${formatCurrencyAmount(item.applied_amount, cur)} applied`;
  return '-';
}

function invoiceCandidateHasPositiveOutstanding(outstandingRaw: string): boolean {
  const outstanding = Number.parseFloat(outstandingRaw);
  return !Number.isNaN(outstanding) && outstanding > 0;
}

function getPaymentMethodBadgeClass(method: PaymentHistoryMethod): string {
  if (method === 'Bank Transfer') return 'bg-[#14B8A6] text-white';
  if (method === 'Card Payment') return 'bg-[#8B5CF6] text-white';
  return 'bg-[#F97316] text-white';
}

function getPaymentStatusBadgeClass(status: BillingPaymentHistoryStatus): string {
  if (status === 'DEPOSITED') return 'bg-[#10B981] text-white';
  if (status === 'PENDING' || status === 'NOT_DEPOSITED') return 'bg-[#F59E0B] text-white';
  if (status === 'WITHHELD_RETURNED') return 'bg-[#1F2937] text-white';
  if (status === 'VOIDED') return 'bg-[#6B7280] text-white';
  return 'bg-[#E4E4E7] text-[#3F3F46]';
}

function getPaymentAllocationStatusBadgeClass(
  status: BillingPaymentHistoryAllocationStatus
): string {
  if (status === 'ALLOCATED') return 'bg-[#DBEAFE] text-[#2563EB]';
  if (status === 'PARTIALLY_ALLOCATED') return 'bg-[#FFEDD5] text-[#EA580C]';
  return 'bg-[#E4E4E7] text-[#3F3F46]';
}

function mapProviderToPaymentMethod(provider: string): PaymentHistoryMethod {
  const u = provider.toUpperCase();
  if (u === 'BRAINTREE' || u === 'STRIPE' || u === 'ADYEN' || u === 'CARD') return 'Card Payment';
  if (u === 'CASH') return 'Cash';
  return 'Bank Transfer';
}

function buildPaymentHistoryWarning(status: string): PaymentHistoryRow['warning'] | undefined {
  const u = status.toUpperCase();
  if (u === 'VOIDED' || u === 'WITHHELD_RETURNED') {
    return {
      tone: 'neutral',
      title: 'This payment has been voided.',
      message:
        'All allocations have been reversed and the related invoices have been updated. This record is kept for audit purposes and cannot be modified.',
    };
  }
  return undefined;
}

function resolvePaymentAllocatedToDisplay(item: BillingPaymentListItem, currency: string): string {
  const summary = item.allocated_to_summary?.trim();
  if (summary) return summary;
  const fromAllocations = buildBillingPaymentAllocatedToSummary(item.allocations, currency);
  if (fromAllocations) return fromAllocations;
  return '-';
}

function formatPaymentInvoiceLabel(allocation: BillingPaymentAllocationLine): string {
  const n = allocation.invoice_number?.trim();
  if (n) return n;
  const id = allocation.invoice_id;
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function billingAllocationToDrawerRow(
  allocation: BillingPaymentAllocationLine,
  currency: string,
  index: number
): PaymentHistoryAllocationRow {
  const dateSrc = allocation.invoice_date?.trim() || allocation.created_at;
  const dateOnly =
    dateSrc && dateSrc.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(dateSrc)
      ? dateSrc.slice(0, 10)
      : '';
  const notes =
    allocation.notes?.trim() ||
    (allocation.line_status ? allocation.line_status.replaceAll('_', ' ') : '') ||
    '—';

  return {
    rowKey: `${allocation.invoice_id}-${String(allocation.revision_no ?? '')}-${allocation.created_at}-${index}`,
    invoiceLabel: formatPaymentInvoiceLabel(allocation),
    totalDisplay:
      allocation.invoice_total != null && String(allocation.invoice_total).trim() !== ''
        ? formatCurrencyAmount(allocation.invoice_total, currency)
        : '—',
    allocated: formatCurrencyAmount(allocation.allocated_amount, currency),
    remainingDisplay:
      allocation.remaining_amount != null && String(allocation.remaining_amount).trim() !== ''
        ? formatCurrencyAmount(allocation.remaining_amount, currency)
        : '—',
    revisionDisplay:
      allocation.revision_no != null && !Number.isNaN(allocation.revision_no)
        ? String(allocation.revision_no)
        : '—',
    recordedOn: dateOnly ? formatApiDate(dateOnly) : '—',
    notesLine: notes,
  };
}

function formatRemittanceFileSize(bytes: number | null): string {
  if (bytes == null || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mapBillingPaymentListItemToRow(
  item: BillingPaymentListItem,
  currency: string
): PaymentHistoryRow {
  const rawDate = item.payment_date.slice(0, 10);
  return {
    id: item.id,
    paymentId: item.payment_number,
    paymentDate: rawDate,
    paymentMethod: mapProviderToPaymentMethod(item.provider),
    amount: item.amount,
    status: normalizeBillingPaymentHistoryStatus(item.status),
    allocatedTo: resolvePaymentAllocatedToDisplay(item, currency),
    remaining:
      item.remaining_summary && item.remaining_summary.trim().length > 0
        ? item.remaining_summary
        : item.unallocated_amount && item.unallocated_amount.trim().length > 0
          ? `${formatCurrencyAmount(item.unallocated_amount, currency)}\n(on account)`
          : '-',
    allocationStatus: normalizeBillingPaymentAllocationStatus(item.allocation_status),
    bankReference: item.bank_reference ?? '-',
    recordedBy: item.recorded_by ?? undefined,
    warning: buildPaymentHistoryWarning(item.status),
    allocationBreakdown: [],
  };
}

function mergePaymentDetailIntoRow(
  detail: BillingPaymentDetail,
  listRow: PaymentHistoryRow | null,
  currency: string
): PaymentHistoryRow {
  const base =
    listRow ??
    mapBillingPaymentListItemToRow(
      {
        id: detail.id,
        payment_number: detail.payment_number,
        payment_date: detail.payment_date,
        amount: detail.amount,
        currency: detail.currency,
        status: detail.status,
        allocation_status: detail.allocation_status,
        provider: detail.provider,
        bank_reference: detail.bank_reference,
        recorded_by: detail.recorded_by,
        allocated_to_summary:
          buildBillingPaymentAllocatedToSummary(detail.allocations, currency) || null,
        remaining_summary: null,
        unallocated_amount: detail.unallocated_amount,
        allocated_amount: detail.allocated_amount,
        allocations: detail.allocations,
      },
      currency
    );
  const breakdown: PaymentHistoryAllocationRow[] = detail.allocations.map((a, idx) =>
    billingAllocationToDrawerRow(a, currency, idx)
  );
  const allocatedTo =
    breakdown.length > 0
      ? breakdown.map((b) => `${b.invoiceLabel} (${b.allocated})`).join('\n')
      : base.allocatedTo;
  let remaining = base.remaining;
  if (detail.unallocated_amount != null && String(detail.unallocated_amount).trim() !== '') {
    const num = Number.parseFloat(detail.unallocated_amount);
    remaining = `${formatCurrencyAmount(detail.unallocated_amount, currency)}${
      !Number.isNaN(num) && num > 0 ? '\n(on account)' : ''
    }`;
  }
  return {
    ...base,
    allocatedTo,
    remaining,
    allocationBreakdown: breakdown,
    warning: buildPaymentHistoryWarning(detail.status) ?? base.warning,
  };
}

function BillingKpiCard(props: {
  iconSrc?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  label: string;
  value: string;
  variant?: 'default' | 'critical';
}): React.JSX.Element {
  const Icon = props.icon;
  const isCritical = props.variant === 'critical';
  return (
    <div
      className={cn(
        'flex flex-col items-start rounded-lg border bg-white p-4 text-left',
        isCritical ? 'border-[#FECACA] bg-[#FEF2F2]' : 'border-[#E5E7EB]'
      )}
    >
      {props.iconSrc ? (
        <img src={props.iconSrc} alt="" className="h-5 w-5 shrink-0" aria-hidden />
      ) : Icon ? (
        <Icon
          className={cn('h-5 w-5 shrink-0 stroke-[1.75]', props.iconClassName ?? 'text-[#71717A]')}
        />
      ) : null}
      <Typography
        variant="caption"
        className="mt-3 text-[13px] font-normal leading-snug text-[#52525B]"
      >
        {props.label}
      </Typography>
      <Typography
        component="p"
        variant="h6"
        className="mt-2 text-[26px] font-bold leading-none tracking-tight text-[#18181B]"
      >
        {props.value}
      </Typography>
    </div>
  );
}

function RefundSummaryCards({
  kpis,
  isLoading,
}: {
  kpis?: BillingRefundKpis;
  isLoading: boolean;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {REFUND_STATS_META.map((item) => (
        <BillingKpiCard
          key={item.label}
          iconSrc={'iconSrc' in item ? item.iconSrc : undefined}
          icon={'icon' in item ? item.icon : undefined}
          iconClassName={'iconClass' in item ? item.iconClass : undefined}
          label={item.label}
          value={
            isLoading
              ? '...'
              : item.key === 'total_refund_amount'
                ? formatCurrencyAmount(kpis?.total_refund_amount ?? '0.00')
                : item.key === 'avg_refund_time_days'
                  ? String(kpis?.avg_refund_time_days ?? 0)
                  : String(kpis?.[item.key] ?? 0)
          }
          variant={item.tone === 'danger' ? 'critical' : 'default'}
        />
      ))}
    </div>
  );
}

function InvoiceSummaryCards({
  summary,
  isLoading,
}: {
  summary?: InvoiceSummaryResponse;
  isLoading: boolean;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {INVOICE_STATS_META.map((item) => (
        <BillingKpiCard
          key={item.label}
          iconSrc={item.iconSrc}
          label={item.label}
          value={isLoading ? '...' : String(summary?.[item.key] ?? 0)}
          variant={item.tone === 'danger' ? 'critical' : 'default'}
        />
      ))}
    </div>
  );
}

function InvoicesFilterToolbar({
  searchValue,
  onSearchChange,
  filters,
  setFilters,
  invoicedDateRange,
  setInvoicedDateRange,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: InvoiceFilterState;
  setFilters: React.Dispatch<React.SetStateAction<InvoiceFilterState>>;
  invoicedDateRange: DateRange | undefined;
  setInvoicedDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}): React.JSX.Element {
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [paymentStatusOpen, setPaymentStatusOpen] = React.useState(false);
  const [dateOpen, setDateOpen] = React.useState(false);

  const statusLabel =
    filters.statuses.length === 0
      ? 'Select Status'
      : filters.statuses.length === 1
        ? INVOICE_STATUS_LABELS[filters.statuses[0]]
        : `Status (${filters.statuses.length})`;
  const paymentStatusLabel =
    filters.paymentStatuses.length === 0
      ? 'Select Payment Status'
      : filters.paymentStatuses.length === 1
        ? INVOICE_PAYMENT_STATUS_LABELS[filters.paymentStatuses[0]]
        : `Payment (${filters.paymentStatuses.length})`;

  const dateLabel = React.useMemo(() => {
    if (!invoicedDateRange?.from || !invoicedDateRange.to) return 'Any Invoice Date';
    return `${format(invoicedDateRange.from, 'd MMM yyyy')} – ${format(invoicedDateRange.to, 'd MMM yyyy')}`;
  }, [invoicedDateRange]);

  const toggleStatus = (value: InvoiceLifecycleStatus, checked: boolean): void => {
    setFilters((prev) => ({
      ...prev,
      statuses: checked
        ? [...prev.statuses.filter((v) => v !== value), value]
        : prev.statuses.filter((v) => v !== value),
    }));
  };

  const togglePaymentStatus = (value: InvoicePaymentStatus, checked: boolean): void => {
    setFilters((prev) => ({
      ...prev,
      paymentStatuses: checked
        ? [...prev.paymentStatuses.filter((v) => v !== value), value]
        : prev.paymentStatuses.filter((v) => v !== value),
    }));
  };

  return (
    <div className="flex min-w-0 flex-nowrap items-center gap-3 overflow-x-auto">
      <Input
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search invoice number or order ID..."
        leftIcon={Search}
        className="h-10 min-w-[200px] flex-1 border-[#E4E4E7]"
      />

      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(BILLING_TOOLBAR_TRIGGER_CLASS, 'min-w-[150px] max-w-[200px]')}
          >
            <span className="min-w-0 flex-1 truncate text-left">{statusLabel}</span>
            <ChevronDown className="size-4 shrink-0 text-[#A1A1AA]" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2rem,280px)] p-2" align="start">
          <div className="max-h-[min(45vh,320px)] space-y-0.5 overflow-y-auto py-1">
            {INVOICE_FILTER_STATUSES.map((value) => (
              <div key={value} className="px-1 py-0.5">
                <Checkbox
                  label={INVOICE_STATUS_LABELS[value]}
                  checked={filters.statuses.includes(value)}
                  onChange={(e) => toggleStatus(value, e.target.checked)}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-end border-t border-[#F4F4F5] pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-[#71717A]"
              onClick={() => setFilters((prev) => ({ ...prev, statuses: [] }))}
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={paymentStatusOpen} onOpenChange={setPaymentStatusOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(BILLING_TOOLBAR_TRIGGER_CLASS, 'min-w-[210px] max-w-[280px]')}
          >
            <span className="min-w-0 flex-1 truncate text-left">{paymentStatusLabel}</span>
            <ChevronDown className="size-4 shrink-0 text-[#A1A1AA]" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2rem,320px)] p-2" align="start">
          <div className="max-h-[min(45vh,320px)] space-y-0.5 overflow-y-auto py-1">
            {INVOICE_FILTER_PAYMENT_STATUSES.map((value) => (
              <div key={value} className="px-1 py-0.5">
                <Checkbox
                  label={INVOICE_PAYMENT_STATUS_LABELS[value]}
                  checked={filters.paymentStatuses.includes(value)}
                  onChange={(e) => togglePaymentStatus(value, e.target.checked)}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-end border-t border-[#F4F4F5] pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-[#71717A]"
              onClick={() => setFilters((prev) => ({ ...prev, paymentStatuses: [] }))}
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={dateOpen} onOpenChange={setDateOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(BILLING_TOOLBAR_TRIGGER_CLASS, 'min-w-[220px] max-w-[min(100%,340px)]')}
          >
            <CalendarDays className="size-4 shrink-0 text-[#A1A1AA]" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-right">{dateLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0" align="start">
          <Calendar
            mode="range"
            selected={invoicedDateRange}
            onSelect={(next) => {
              setInvoicedDateRange(next);
              if (next?.from && next?.to) setDateOpen(false);
            }}
            numberOfMonths={2}
            initialFocus
          />
          <div className="flex items-center justify-between border-t border-[#F4F4F5] px-3 py-2">
            <Checkbox
              label="Show Draft Invoices"
              checked={filters.showDraft}
              onChange={(e) => setFilters((prev) => ({ ...prev, showDraft: e.target.checked }))}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-[#71717A]"
              onClick={() => setInvoicedDateRange(undefined)}
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function RefundsFilterToolbar({
  searchValue,
  onSearchChange,
  appliedRefundFilters,
  setAppliedRefundFilters,
  refundDateRange,
  setRefundDateRange,
  onOpenAdvancedFilters,
  advancedFilterSelections,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  appliedRefundFilters: RefundFilterDraft;
  setAppliedRefundFilters: React.Dispatch<React.SetStateAction<RefundFilterDraft>>;
  refundDateRange: DateRange | undefined;
  setRefundDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  onOpenAdvancedFilters: () => void;
  advancedFilterSelections: number;
}): React.JSX.Element {
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [reasonOpen, setReasonOpen] = React.useState(false);
  const [dateOpen, setDateOpen] = React.useState(false);

  const statusButtonLabel =
    appliedRefundFilters.statuses.length === 0
      ? 'Select Status'
      : appliedRefundFilters.statuses.length === 1
        ? REFUND_STATUS_LABELS[appliedRefundFilters.statuses[0]]
        : `Status (${appliedRefundFilters.statuses.length})`;

  const reasonButtonLabel =
    appliedRefundFilters.reasons.length === 0
      ? 'Select Reason Category'
      : appliedRefundFilters.reasons.length === 1
        ? REFUND_REASON_CATEGORY_LABELS[appliedRefundFilters.reasons[0]]
        : `Reason (${appliedRefundFilters.reasons.length})`;

  const dateLabel = React.useMemo(() => {
    if (!refundDateRange?.from || !refundDateRange.to) return 'Any Date';
    return `${format(refundDateRange.from, 'd MMM yyyy')} – ${format(refundDateRange.to, 'd MMM yyyy')}`;
  }, [refundDateRange]);

  const setStatuses = React.useCallback(
    (next: BillingRefundStatus[]) => {
      setAppliedRefundFilters((prev) => ({ ...prev, statuses: next }));
    },
    [setAppliedRefundFilters]
  );

  const setReasons = React.useCallback(
    (next: BillingRefundReasonCategory[]) => {
      setAppliedRefundFilters((prev) => ({ ...prev, reasons: next }));
    },
    [setAppliedRefundFilters]
  );

  const toggleStatus = React.useCallback(
    (value: BillingRefundStatus, checked: boolean): void => {
      setAppliedRefundFilters((prev) => ({
        ...prev,
        statuses: checked
          ? [...prev.statuses.filter((s) => s !== value), value]
          : prev.statuses.filter((s) => s !== value),
      }));
    },
    [setAppliedRefundFilters]
  );

  const toggleReason = React.useCallback(
    (value: BillingRefundReasonCategory, checked: boolean): void => {
      setAppliedRefundFilters((prev) => ({
        ...prev,
        reasons: checked
          ? [...prev.reasons.filter((r) => r !== value), value]
          : prev.reasons.filter((r) => r !== value),
      }));
    },
    [setAppliedRefundFilters]
  );

  return (
    <div className="flex min-w-0 flex-nowrap items-center gap-3 overflow-x-auto">
      <Input
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search refund number, payment number, invoice number..."
        leftIcon={Search}
        className="h-10 min-w-[200px] flex-1 border-[#E4E4E7]"
      />

      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(BILLING_TOOLBAR_TRIGGER_CLASS, 'min-w-[148px] max-w-[200px]')}
          >
            <span className="min-w-0 flex-1 truncate text-left">{statusButtonLabel}</span>
            <ChevronDown className="size-4 shrink-0 text-[#A1A1AA]" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2rem,280px)] p-2" align="start">
          <div className="max-h-[min(45vh,320px)] space-y-0.5 overflow-y-auto py-1">
            {BILLING_REFUND_FILTER_STATUSES.map((value) => (
              <div key={value} className="px-1 py-0.5">
                <Checkbox
                  label={REFUND_STATUS_LABELS[value]}
                  checked={appliedRefundFilters.statuses.includes(value)}
                  onChange={(e) => toggleStatus(value, e.target.checked)}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-end border-t border-[#F4F4F5] pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-[#71717A]"
              onClick={() => {
                setStatuses([]);
              }}
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={reasonOpen} onOpenChange={setReasonOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(BILLING_TOOLBAR_TRIGGER_CLASS, 'min-w-[200px] max-w-[260px]')}
          >
            <span className="min-w-0 flex-1 truncate text-left">{reasonButtonLabel}</span>
            <ChevronDown className="size-4 shrink-0 text-[#A1A1AA]" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2rem,300px)] p-2" align="start">
          <div className="max-h-[min(45vh,320px)] space-y-0.5 overflow-y-auto py-1">
            {BILLING_REFUND_FILTER_REASON_CATEGORIES.map((value) => (
              <div key={value} className="px-1 py-0.5">
                <Checkbox
                  label={REFUND_REASON_CATEGORY_LABELS[value]}
                  checked={appliedRefundFilters.reasons.includes(value)}
                  onChange={(e) => toggleReason(value, e.target.checked)}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-end border-t border-[#F4F4F5] pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-[#71717A]"
              onClick={() => {
                setReasons([]);
              }}
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={dateOpen} onOpenChange={setDateOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(BILLING_TOOLBAR_TRIGGER_CLASS, 'min-w-[220px] max-w-[min(100%,340px)]')}
          >
            <CalendarDays className="size-4 shrink-0 text-[#A1A1AA]" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-right">{dateLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0" align="start">
          <Calendar
            mode="range"
            selected={refundDateRange}
            onSelect={(next) => {
              setRefundDateRange(next);
              if (next?.from && next?.to) {
                setDateOpen(false);
              }
            }}
            numberOfMonths={2}
            initialFocus
          />
          <div className="flex items-center justify-end gap-2 border-t border-[#F4F4F5] px-3 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-[#71717A]"
              onClick={() => {
                setRefundDateRange(undefined);
              }}
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="outline"
        className={cn(BILLING_TOOLBAR_TRIGGER_CLASS, 'min-w-[132px]')}
        onClick={onOpenAdvancedFilters}
      >
        <SlidersHorizontal className="size-4 shrink-0 text-[#71717A]" aria-hidden />
        <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
          Filters
          {advancedFilterSelections > 0 ? (
            <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#BE1E2D] px-1.5 text-[11px] font-medium leading-none text-white">
              {advancedFilterSelections}
            </span>
          ) : null}
        </span>
      </Button>
    </div>
  );
}

function CreditNotesFilterToolbar({
  searchValue,
  onSearchChange,
  filters,
  setFilters,
  issuedDateRange,
  setIssuedDateRange,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: CreditNoteFilterState;
  setFilters: React.Dispatch<React.SetStateAction<CreditNoteFilterState>>;
  issuedDateRange: DateRange | undefined;
  setIssuedDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}): React.JSX.Element {
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [reasonOpen, setReasonOpen] = React.useState(false);
  const [dateOpen, setDateOpen] = React.useState(false);
  const [statusDraft, setStatusDraft] = React.useState<BillingCreditNoteStatus[]>(filters.statuses);
  const [reasonDraft, setReasonDraft] = React.useState<BillingCreditNoteReasonCategory[]>(
    filters.reasons
  );

  React.useEffect(() => {
    if (statusOpen) setStatusDraft(filters.statuses);
  }, [statusOpen, filters.statuses]);
  React.useEffect(() => {
    if (reasonOpen) setReasonDraft(filters.reasons);
  }, [reasonOpen, filters.reasons]);

  const statusLabel =
    filters.statuses.length === 0
      ? 'Select Status'
      : filters.statuses.length === 1
        ? CREDIT_NOTE_STATUS_LABELS[filters.statuses[0]]
        : `Status (${filters.statuses.length})`;
  const reasonLabel =
    filters.reasons.length === 0
      ? 'Select Reason Category'
      : filters.reasons.length === 1
        ? CREDIT_NOTE_REASON_CATEGORY_LABELS[filters.reasons[0]]
        : `Reason (${filters.reasons.length})`;
  const dateLabel = React.useMemo(() => {
    if (!issuedDateRange?.from || !issuedDateRange.to) return 'Any Issue Date';
    return `${format(issuedDateRange.from, 'd MMM yyyy')} – ${format(issuedDateRange.to, 'd MMM yyyy')}`;
  }, [issuedDateRange]);

  return (
    <div className="flex min-w-0 flex-nowrap items-center gap-3 overflow-x-auto">
      <Input
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search CN number, amount, reason, linked invoice..."
        leftIcon={Search}
        className="h-10 min-w-[200px] flex-1 border-[#E4E4E7]"
      />

      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(BILLING_TOOLBAR_TRIGGER_CLASS, 'min-w-[150px] max-w-[220px]')}
          >
            <span className="min-w-0 flex-1 truncate text-left">{statusLabel}</span>
            <ChevronDown className="size-4 shrink-0 text-[#A1A1AA]" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2rem,290px)] p-2" align="start">
          <div className="max-h-[300px] space-y-0.5 overflow-y-auto py-1">
            {CREDIT_NOTE_FILTER_STATUS_OPTIONS.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2 px-1 py-1">
                <input
                  type="checkbox"
                  checked={statusDraft.includes(opt.value)}
                  onChange={(e) =>
                    setStatusDraft((prev) =>
                      e.target.checked
                        ? [...prev.filter((s) => s !== opt.value), opt.value]
                        : prev.filter((s) => s !== opt.value)
                    )
                  }
                  className="size-4 rounded border-[#D4D4D8] text-[#BE1E2D] focus:ring-[#BE1E2D]"
                />
                <Badge className={cn('border-0', CREDIT_NOTE_STATUS_BADGE_CLASS[opt.value])}>
                  {opt.label}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[#F4F4F5] pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 border-[#D4D4D8] text-[#71717A]"
              onClick={() => setStatusDraft([])}
            >
              Reset
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 bg-[#BE1E2D] text-white hover:bg-[#A21926]"
              onClick={() => {
                setFilters((prev) => ({ ...prev, statuses: statusDraft }));
                setStatusOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={reasonOpen} onOpenChange={setReasonOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(BILLING_TOOLBAR_TRIGGER_CLASS, 'min-w-[200px] max-w-[260px]')}
          >
            <span className="min-w-0 flex-1 truncate text-left">{reasonLabel}</span>
            <ChevronDown className="size-4 shrink-0 text-[#A1A1AA]" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2rem,300px)] p-2" align="start">
          <div className="max-h-[300px] space-y-0.5 overflow-y-auto py-1">
            {CREDIT_NOTE_FILTER_REASON_OPTIONS.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2 px-1 py-1">
                <input
                  type="checkbox"
                  checked={reasonDraft.includes(opt.value)}
                  onChange={(e) =>
                    setReasonDraft((prev) =>
                      e.target.checked
                        ? [...prev.filter((r) => r !== opt.value), opt.value]
                        : prev.filter((r) => r !== opt.value)
                    )
                  }
                  className="size-4 rounded border-[#D4D4D8] text-[#BE1E2D] focus:ring-[#BE1E2D]"
                />
                <Badge className={cn('border-0', CREDIT_NOTE_REASON_BADGE_CLASS[opt.value])}>
                  {opt.label}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[#F4F4F5] pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 border-[#D4D4D8] text-[#71717A]"
              onClick={() => setReasonDraft([])}
            >
              Reset
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 bg-[#BE1E2D] text-white hover:bg-[#A21926]"
              onClick={() => {
                setFilters((prev) => ({ ...prev, reasons: reasonDraft }));
                setReasonOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={dateOpen} onOpenChange={setDateOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(BILLING_TOOLBAR_TRIGGER_CLASS, 'min-w-[220px] max-w-[min(100%,340px)]')}
          >
            <CalendarDays className="size-4 shrink-0 text-[#A1A1AA]" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-right">{dateLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0" align="start">
          <Calendar
            mode="range"
            selected={issuedDateRange}
            onSelect={(next) => {
              setIssuedDateRange(next);
              if (next?.from && next?.to) setDateOpen(false);
            }}
            numberOfMonths={2}
            initialFocus
          />
          <div className="flex items-center justify-end border-t border-[#F4F4F5] px-3 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-[#71717A]"
              onClick={() => setIssuedDateRange(undefined)}
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface InvoiceListRow {
  id: string;
  invoiceNumber: string;
  orderReference: string;
  issueDate: string;
  dueDate: string;
  total: string;
  paid: string;
  balance: string;
  status: string;
}

function InvoicesTable({
  rows,
  total,
  page,
  pages,
  size,
  isLoading,
  isError,
  onRetry,
  onPageChange,
  onPageSizeChange,
  onView,
}: {
  rows: InvoiceListRow[];
  total: number;
  page: number;
  pages: number;
  size: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextSize: number) => void;
  onView: (id: string) => void;
}): React.JSX.Element {
  const safePages = Math.max(1, pages);
  const safePage = Math.min(Math.max(1, page), safePages);
  return (
    <div className="rounded-xl border border-[#E4E4E7] bg-white p-3">
      <div className="overflow-x-auto pb-1">
        <Table className="min-w-[1140px]">
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Issued Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isError ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center">
                  <div className="space-y-3">
                    <Typography className="text-sm text-[#71717A]">
                      Could not load invoices.
                    </Typography>
                    <Button variant="outline" size="sm" onClick={onRetry}>
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
            {isLoading && !isError ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-sm text-[#71717A]">
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : null}
            {!isLoading && !isError && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-sm text-[#71717A]">
                  No invoices found for current filters.
                </TableCell>
              </TableRow>
            ) : null}
            {!isLoading && !isError
              ? rows.map((row) => (
                  <TableRow key={row.id} className="h-14">
                    <TableCell className="font-medium text-[#52525B]">
                      {row.invoiceNumber}
                    </TableCell>
                    <TableCell>{row.orderReference}</TableCell>
                    <TableCell>{row.issueDate}</TableCell>
                    <TableCell>{row.dueDate}</TableCell>
                    <TableCell>{row.total}</TableCell>
                    <TableCell>{row.paid}</TableCell>
                    <TableCell>{row.balance}</TableCell>
                    <TableCell>
                      <Badge className={cn('border-0', getBadgeClass(row.status))}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="inline-flex items-center text-[#71717A]"
                        onClick={() => onView(row.id)}
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>
      <div className="mt-3 flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-sm text-[#52525B]">
          <span>Show</span>
          <select
            className="h-8 rounded border border-[#E4E4E7] px-2"
            value={String(size)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span>entries out of {total}</span>
        </div>
        <Pagination currentPage={safePage} totalPages={safePages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}

interface RefundListRow {
  id: string;
  refundNumber: string;
  paymentNumber: string;
  invoiceNumber: string;
  braintreeRefundId: string;
  linkedBooking: string;
  refundDate: string;
  amount: string;
  reasonCategory: string;
  method: string;
  completionDate: string;
  status: string;
}

function RefundsTable({
  rows,
  total,
  page,
  pages,
  size,
  isLoading,
  isError,
  onRetry,
  onPageChange,
  onPageSizeChange,
  onView,
}: {
  rows: RefundListRow[];
  total: number;
  page: number;
  pages: number;
  size: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextSize: number) => void;
  onView: (id: string) => void;
}): React.JSX.Element {
  const safePages = Math.max(1, pages);
  const safePage = Math.min(Math.max(1, page), safePages);

  return (
    <div className="rounded-xl border border-[#E4E4E7] bg-white p-3">
      <div className="overflow-x-auto pb-1">
        <Table className="min-w-[1320px]">
          <TableHeader>
            <TableRow>
              <TableHead># ID</TableHead>
              <TableHead>Payment ID</TableHead>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Braintree Refund ID</TableHead>
              <TableHead>Linked Booking</TableHead>
              <TableHead>Refund Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reason Category</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Completion Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isError ? (
              <TableRow>
                <TableCell colSpan={12} className="py-10 text-center">
                  <div className="space-y-3">
                    <Typography className="text-sm text-[#71717A]">
                      Could not load refunds.
                    </Typography>
                    <Button variant="outline" size="sm" onClick={onRetry}>
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
            {isLoading && !isError ? (
              <TableRow>
                <TableCell colSpan={12} className="py-10 text-center text-sm text-[#71717A]">
                  Loading refunds...
                </TableCell>
              </TableRow>
            ) : null}
            {!isLoading && !isError && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="py-10 text-center text-sm text-[#71717A]">
                  No refunds found for current filters.
                </TableCell>
              </TableRow>
            ) : null}
            {!isLoading && !isError
              ? rows.map((row) => (
                  <TableRow key={row.id} className="h-14">
                    <TableCell className="font-medium text-[#52525B]">{row.refundNumber}</TableCell>
                    <TableCell className="text-[#52525B]">{row.paymentNumber}</TableCell>
                    <TableCell className="text-[#52525B]">{row.invoiceNumber}</TableCell>
                    <TableCell className="text-[#52525B]">{row.braintreeRefundId}</TableCell>
                    <TableCell>{row.linkedBooking}</TableCell>
                    <TableCell>{row.refundDate}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                    <TableCell>
                      <Badge className={cn('border-0', getBadgeClass(row.reasonCategory))}>
                        {row.reasonCategory}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('border-0', getBadgeClass(row.method))}>
                        {row.method}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.completionDate}</TableCell>
                    <TableCell>
                      <Badge className={cn('border-0', getBadgeClass(row.status))}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="inline-flex items-center text-[#71717A]"
                        onClick={() => onView(row.id)}
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>
      <div className="mt-3 flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-sm text-[#52525B]">
          <span>Show</span>
          <select
            className="h-8 rounded border border-[#E4E4E7] px-2"
            value={String(size)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span>entries out of {total}</span>
        </div>
        <Pagination currentPage={safePage} totalPages={safePages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}

interface CreditNoteListRow {
  id: string;
  creditNoteNumber: string;
  issueDate: string;
  amount: string;
  reasonCategory: string;
  status: string;
  allocatedTo: string;
  remaining: string;
}

function CreditNotesTable({
  rows,
  total,
  page,
  pages,
  size,
  isLoading,
  isError,
  onRetry,
  onPageChange,
  onPageSizeChange,
  onView,
}: {
  rows: CreditNoteListRow[];
  total: number;
  page: number;
  pages: number;
  size: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextSize: number) => void;
  onView: (id: string) => void;
}): React.JSX.Element {
  const safePages = Math.max(1, pages);
  const safePage = Math.min(Math.max(1, page), safePages);
  return (
    <div className="rounded-xl border border-[#E4E4E7] bg-white p-3">
      <div className="overflow-x-auto">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow>
              <TableHead>Credit Note No.</TableHead>
              <TableHead>Issued Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reason Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Allocated To</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isError ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center">
                  <div className="space-y-3">
                    <Typography className="text-sm text-[#71717A]">
                      Could not load credit notes.
                    </Typography>
                    <Button variant="outline" size="sm" onClick={onRetry}>
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
            {isLoading && !isError ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-[#71717A]">
                  Loading credit notes...
                </TableCell>
              </TableRow>
            ) : null}
            {!isLoading && !isError && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-[#71717A]">
                  No credit notes found for current filters.
                </TableCell>
              </TableRow>
            ) : null}
            {!isLoading && !isError
              ? rows.map((row) => (
                  <TableRow key={row.id} className="h-14">
                    <TableCell className="font-medium text-[#52525B] underline">
                      {row.creditNoteNumber}
                    </TableCell>
                    <TableCell>{row.issueDate}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'border-0',
                          row.reasonCategory === CREDIT_NOTE_REASON_CATEGORY_LABELS.BILLING_ERROR
                            ? CREDIT_NOTE_REASON_BADGE_CLASS.BILLING_ERROR
                            : row.reasonCategory ===
                                CREDIT_NOTE_REASON_CATEGORY_LABELS.SERVICE_FAILURE
                              ? CREDIT_NOTE_REASON_BADGE_CLASS.SERVICE_FAILURE
                              : row.reasonCategory ===
                                  CREDIT_NOTE_REASON_CATEGORY_LABELS.CLIENT_REQUEST
                                ? CREDIT_NOTE_REASON_BADGE_CLASS.CLIENT_REQUEST
                                : CREDIT_NOTE_REASON_BADGE_CLASS.OTHER
                        )}
                      >
                        {row.reasonCategory}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'border-0',
                          row.status === CREDIT_NOTE_STATUS_LABELS.OPEN
                            ? CREDIT_NOTE_STATUS_BADGE_CLASS.OPEN
                            : row.status === CREDIT_NOTE_STATUS_LABELS.PARTIALLY_APPLIED
                              ? CREDIT_NOTE_STATUS_BADGE_CLASS.PARTIALLY_APPLIED
                              : row.status === CREDIT_NOTE_STATUS_LABELS.FULLY_APPLIED
                                ? CREDIT_NOTE_STATUS_BADGE_CLASS.FULLY_APPLIED
                                : CREDIT_NOTE_STATUS_BADGE_CLASS.VOID
                        )}
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-pre-line underline">
                      {row.allocatedTo}
                    </TableCell>
                    <TableCell>{row.remaining}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="inline-flex items-center text-[#71717A]"
                        onClick={() => onView(row.id)}
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>
      <div className="mt-3 flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-sm text-[#52525B]">
          <span>Show</span>
          <select
            className="h-8 rounded border border-[#E4E4E7] px-2"
            value={String(size)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span>entries out of {total}</span>
        </div>
        <Pagination currentPage={safePage} totalPages={safePages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}

function NoInvoicesState(): React.JSX.Element {
  return (
    <div className="rounded-xl border border-[#E4E4E7] bg-white p-4">
      <div className="flex min-h-[520px] items-center justify-center rounded-[10px] border border-dashed border-[#E5E7EB] bg-[#FAFAFA]">
        <div className="flex max-w-[460px] flex-col items-center text-center">
          <img
            src={NoInvoicesYetIllustration}
            alt="No invoices yet"
            className="mb-4 h-[92px] w-[92px]"
          />
          <Typography className="text-[34px] font-semibold leading-tight text-[#18181B]">
            No invoices generated yet.
          </Typography>
          <Typography className="mt-2 text-sm text-[#71717A]">
            Invoices will appear here when created from bookings or manually added by Admin.
          </Typography>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();
  const currentSection: BillingSection =
    section === 'payment-details' ||
    section === 'statements' ||
    section === 'credit-notes' ||
    section === 'refunds'
      ? section
      : 'invoices';

  const meta = SECTION_META[currentSection];
  const organizationId = useSelector((s: RootState) => {
    const fromUser = s.auth.user?.organization_id;
    if (fromUser) return fromUser;
    return (
      s.auth.loginResponse?.data?.organization_id ??
      s.auth.loginResponse?.data?.organization?.id ??
      null
    );
  });
  const [invoiceSearchInput, setInvoiceSearchInput] = React.useState('');
  const [debouncedInvoiceSearch, setDebouncedInvoiceSearch] = React.useState('');
  const [invoicePage, setInvoicePage] = React.useState(1);
  const [invoicePageSize, setInvoicePageSize] = React.useState(20);
  const [invoiceDateRange, setInvoiceDateRange] = React.useState<DateRange | undefined>(undefined);
  const [invoiceFilters, setInvoiceFilters] = React.useState<InvoiceFilterState>(
    EMPTY_INVOICE_FILTER_STATE
  );
  const [paymentHistorySearchInput, setPaymentHistorySearchInput] = React.useState('');
  const [debouncedPaymentHistorySearch, setDebouncedPaymentHistorySearch] = React.useState('');
  const [paymentHistoryDateRange, setPaymentHistoryDateRange] = React.useState<
    DateRange | undefined
  >(undefined);
  const [paymentHistoryPage, setPaymentHistoryPage] = React.useState(1);
  const [paymentHistoryPageSize, setPaymentHistoryPageSize] = React.useState(8);
  const [statementDatePickerOpen, setStatementDatePickerOpen] = React.useState(false);
  const [paymentHistoryDatePreset, setPaymentHistoryDatePreset] =
    React.useState<PaymentHistoryDatePresetId>('all');
  const [paymentFiltersOpen, setPaymentFiltersOpen] = React.useState(false);
  const [paymentFilterDraft, setPaymentFilterDraft] = React.useState<PaymentHistoryFilterState>(
    EMPTY_PAYMENT_HISTORY_FILTERS
  );
  const [appliedPaymentFilters, setAppliedPaymentFilters] =
    React.useState<PaymentHistoryFilterState>(EMPTY_PAYMENT_HISTORY_FILTERS);
  const [selectedPaymentHistoryId, setSelectedPaymentHistoryId] = React.useState<string | null>(
    null
  );
  const [statementMode, setStatementMode] = React.useState<'list' | 'generate'>('list');
  const [statementSearchInput, setStatementSearchInput] = React.useState('');
  const [debouncedStatementSearch, setDebouncedStatementSearch] = React.useState('');
  const [statementPage, setStatementPage] = React.useState(1);
  const [statementPageSize, setStatementPageSize] = React.useState(8);
  const [statementPeriodDateRange, setStatementPeriodDateRange] = React.useState<
    DateRange | undefined
  >(undefined);
  const [statementListDatePreset, setStatementListDatePreset] =
    React.useState<StatementListDatePresetId>('all');
  const [statementListDatePresetOpen, setStatementListDatePresetOpen] = React.useState(false);
  const [statementFromDate, setStatementFromDate] = React.useState<Date | undefined>(undefined);
  const [statementToDate, setStatementToDate] = React.useState<Date | undefined>(undefined);
  const [selectedStatementId, setSelectedStatementId] = React.useState<string | null>(null);
  const [pdfPollingStatementId, setPdfPollingStatementId] = React.useState<string | null>(null);
  const [statementFromOpen, setStatementFromOpen] = React.useState(false);
  const [statementToOpen, setStatementToOpen] = React.useState(false);
  const [includeLineItemDetail, setIncludeLineItemDetail] = React.useState(false);
  const [includeCreditNotes, setIncludeCreditNotes] = React.useState(true);
  const [includePaymentHistory, setIncludePaymentHistory] = React.useState(true);
  const [statementPreviewOpen, setStatementPreviewOpen] = React.useState(false);
  const [selectedRefundId, setSelectedRefundId] = React.useState<string | null>(null);
  const [selectedCreditNoteId, setSelectedCreditNoteId] = React.useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [refundSearchInput, setRefundSearchInput] = React.useState('');
  const [debouncedRefundSearch, setDebouncedRefundSearch] = React.useState('');
  const [refundPage, setRefundPage] = React.useState(1);
  const [refundPageSize, setRefundPageSize] = React.useState(20);
  const [refundDateRange, setRefundDateRange] = React.useState<DateRange | undefined>(undefined);
  const [refundFilterDraft, setRefundFilterDraft] =
    React.useState<RefundFilterDraft>(EMPTY_REFUND_FILTER_DRAFT);
  const [appliedRefundFilters, setAppliedRefundFilters] =
    React.useState<RefundFilterDraft>(EMPTY_REFUND_FILTER_DRAFT);
  const [creditNoteSearchInput, setCreditNoteSearchInput] = React.useState('');
  const [debouncedCreditNoteSearch, setDebouncedCreditNoteSearch] = React.useState('');
  const [creditNotePage, setCreditNotePage] = React.useState(1);
  const [creditNotePageSize, setCreditNotePageSize] = React.useState(20);
  const [creditNoteDateRange, setCreditNoteDateRange] = React.useState<DateRange | undefined>(
    undefined
  );
  const [creditNoteFilters, setCreditNoteFilters] = React.useState<CreditNoteFilterState>(
    EMPTY_CREDIT_NOTE_FILTER_STATE
  );
  const [creditNoteActionsOpen, setCreditNoteActionsOpen] = React.useState(false);
  const [applyCreditModalOpen, setApplyCreditModalOpen] = React.useState(false);
  const [creditCandidateSearchInput, setCreditCandidateSearchInput] = React.useState('');
  const [debouncedCreditCandidateSearch, setDebouncedCreditCandidateSearch] = React.useState('');
  const [selectedCandidateInvoiceId, setSelectedCandidateInvoiceId] = React.useState<string | null>(
    null
  );
  const [pdfPollingCreditNoteId, setPdfPollingCreditNoteId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedPaymentHistorySearch(paymentHistorySearchInput.trim()),
      350
    );
    return () => window.clearTimeout(t);
  }, [paymentHistorySearchInput]);
  React.useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedStatementSearch(statementSearchInput.trim()),
      350
    );
    return () => window.clearTimeout(t);
  }, [statementSearchInput]);
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedInvoiceSearch(invoiceSearchInput.trim()), 350);
    return () => window.clearTimeout(t);
  }, [invoiceSearchInput]);
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedRefundSearch(refundSearchInput.trim()), 350);
    return () => window.clearTimeout(t);
  }, [refundSearchInput]);
  React.useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedCreditNoteSearch(creditNoteSearchInput.trim()),
      350
    );
    return () => window.clearTimeout(t);
  }, [creditNoteSearchInput]);
  React.useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedCreditCandidateSearch(creditCandidateSearchInput.trim()),
      300
    );
    return () => window.clearTimeout(t);
  }, [creditCandidateSearchInput]);

  React.useEffect(() => {
    setPaymentHistoryPage(1);
  }, [
    debouncedPaymentHistorySearch,
    paymentHistoryPageSize,
    appliedPaymentFilters,
    paymentHistoryDateRange,
  ]);
  React.useEffect(() => {
    setStatementPage(1);
  }, [
    debouncedStatementSearch,
    statementPageSize,
    statementPeriodDateRange,
    statementListDatePreset,
  ]);
  React.useEffect(() => {
    setInvoicePage(1);
  }, [debouncedInvoiceSearch, invoicePageSize, invoiceFilters, invoiceDateRange]);
  React.useEffect(() => {
    setRefundPage(1);
  }, [debouncedRefundSearch, refundPageSize, appliedRefundFilters, refundDateRange]);
  React.useEffect(() => {
    setCreditNotePage(1);
  }, [debouncedCreditNoteSearch, creditNotePageSize, creditNoteFilters, creditNoteDateRange]);

  const invoiceDateParams = React.useMemo(() => {
    const from = invoiceDateRange?.from;
    const to = invoiceDateRange?.to;
    if (!from || !to) {
      return {
        invoiced_from: undefined as string | undefined,
        invoiced_to: undefined as string | undefined,
      };
    }
    return {
      invoiced_from: format(from, 'yyyy-MM-dd'),
      invoiced_to: format(to, 'yyyy-MM-dd'),
    };
  }, [invoiceDateRange]);
  const refundDateParams = React.useMemo(() => {
    const from = refundDateRange?.from;
    const to = refundDateRange?.to;
    if (!from || !to)
      return {
        date_from: undefined as string | undefined,
        date_to: undefined as string | undefined,
      };
    return { date_from: format(from, 'yyyy-MM-dd'), date_to: format(to, 'yyyy-MM-dd') };
  }, [refundDateRange]);
  const statementListQueryParams = React.useMemo(() => {
    const periodFrom = statementPeriodDateRange?.from;
    const periodTo = statementPeriodDateRange?.to;
    let generated_from: string | undefined;
    let generated_to: string | undefined;
    if (statementListDatePreset !== 'all') {
      const opt = STATEMENT_LIST_DATE_QUICK_OPTIONS.find((o) => o.id === statementListDatePreset);
      if (opt?.days != null) {
        const now = new Date();
        generated_from = startOfDay(subDays(now, opt.days - 1)).toISOString();
        generated_to = endOfDay(now).toISOString();
      }
    }
    return {
      period_start_from: periodFrom && periodTo ? format(periodFrom, 'yyyy-MM-dd') : undefined,
      period_start_to: periodFrom && periodTo ? format(periodTo, 'yyyy-MM-dd') : undefined,
      generated_from,
      generated_to,
    };
  }, [statementPeriodDateRange, statementListDatePreset]);

  const statementGeneratePeriodArgs = React.useMemo(() => {
    if (!statementFromDate || !statementToDate) return undefined;
    return {
      period_start: format(statementFromDate, 'yyyy-MM-dd'),
      period_end: format(statementToDate, 'yyyy-MM-dd'),
      include_line_item_detail: includeLineItemDetail,
      include_credit_notes: includeCreditNotes,
      include_payment_history: includePaymentHistory,
    };
  }, [
    statementFromDate,
    statementToDate,
    includeLineItemDetail,
    includeCreditNotes,
    includePaymentHistory,
  ]);

  const creditNoteDateParams = React.useMemo(() => {
    const from = creditNoteDateRange?.from;
    const to = creditNoteDateRange?.to;
    if (!from || !to) {
      return {
        issued_from: undefined as string | undefined,
        issued_to: undefined as string | undefined,
      };
    }
    return {
      issued_from: format(from, 'yyyy-MM-dd'),
      issued_to: format(to, 'yyyy-MM-dd'),
    };
  }, [creditNoteDateRange]);

  React.useEffect(() => {
    setSelectedPaymentHistoryId(null);
    setPaymentFiltersOpen(false);
    setStatementPreviewOpen(false);
    if (currentSection !== 'statements') setStatementMode('list');
    setSelectedRefundId(null);
    setSelectedCreditNoteId(null);
    setCreditNoteActionsOpen(false);
    setApplyCreditModalOpen(false);
    if (currentSection !== 'refunds') setFiltersOpen(false);
  }, [currentSection]);

  const toggleRefundFilter = React.useCallback(
    <K extends keyof RefundFilterDraft>(section: K, value: RefundFilterDraft[K][number]): void => {
      setRefundFilterDraft((prev) => {
        const bucket = prev[section];
        const str = String(value);
        const list = bucket as readonly string[];
        const next = list.includes(str) ? list.filter((item) => item !== str) : [...list, str];
        return { ...prev, [section]: next as RefundFilterDraft[K] };
      });
    },
    []
  );

  const resetRefundModalDraft = React.useCallback((): void => {
    setRefundFilterDraft(EMPTY_REFUND_FILTER_DRAFT);
  }, []);

  const handleFiltersOpenChange = React.useCallback(
    (open: boolean): void => {
      setFiltersOpen(open);
      if (open) setRefundFilterDraft(appliedRefundFilters);
    },
    [appliedRefundFilters]
  );

  const applyRefundFilters = React.useCallback((): void => {
    setAppliedRefundFilters(refundFilterDraft);
    setRefundPage(1);
    setFiltersOpen(false);
  }, [refundFilterDraft]);
  const handlePaymentFiltersOpenChange = React.useCallback(
    (open: boolean): void => {
      setPaymentFiltersOpen(open);
      if (open) setPaymentFilterDraft(appliedPaymentFilters);
    },
    [appliedPaymentFilters]
  );
  const togglePaymentFilter = React.useCallback(
    <K extends keyof PaymentHistoryFilterState>(
      bucket: K,
      value: PaymentHistoryFilterState[K][number]
    ): void => {
      setPaymentFilterDraft((prev) => {
        const current = prev[bucket] as readonly string[];
        const valueStr = String(value);
        const next = current.includes(valueStr)
          ? current.filter((item) => item !== valueStr)
          : [...current, valueStr];
        return { ...prev, [bucket]: next as PaymentHistoryFilterState[K] };
      });
    },
    []
  );
  const resetPaymentFilterDraft = React.useCallback((): void => {
    setPaymentFilterDraft(EMPTY_PAYMENT_HISTORY_FILTERS);
  }, []);
  const applyPaymentFilters = React.useCallback((): void => {
    setAppliedPaymentFilters(paymentFilterDraft);
    setPaymentHistoryPage(1);
    setPaymentFiltersOpen(false);
  }, [paymentFilterDraft]);

  const handlePaymentHistoryQuickRange = React.useCallback((id: PaymentHistoryDatePresetId) => {
    setPaymentHistoryDatePreset(id);
    if (id === 'all') {
      setPaymentHistoryDateRange(undefined);
      return;
    }
    const opt = PAYMENT_HISTORY_DATE_QUICK_OPTIONS.find((o) => o.id === id);
    if (opt?.days != null) {
      const now = new Date();
      setPaymentHistoryDateRange({
        from: startOfDay(subDays(now, opt.days - 1)),
        to: endOfDay(now),
      });
    }
  }, []);

  const invoicesQueryArg = React.useMemo(
    () =>
      currentSection === 'invoices'
        ? {
            page: invoicePage,
            size: invoicePageSize,
            search: debouncedInvoiceSearch.length > 0 ? debouncedInvoiceSearch : undefined,
            status: invoiceFilters.statuses.length > 0 ? invoiceFilters.statuses : undefined,
            payment_status:
              invoiceFilters.paymentStatuses.length > 0
                ? invoiceFilters.paymentStatuses
                : undefined,
            show_draft: invoiceFilters.showDraft || undefined,
            invoiced_from: invoiceDateParams.invoiced_from,
            invoiced_to: invoiceDateParams.invoiced_to,
            sort_by: 'issue_date' as const,
            sort_order: 'desc' as const,
          }
        : skipToken,
    [
      currentSection,
      invoicePage,
      invoicePageSize,
      debouncedInvoiceSearch,
      invoiceFilters,
      invoiceDateParams,
    ]
  );
  const refundsQueryArg = React.useMemo(
    () =>
      currentSection === 'refunds'
        ? {
            page: refundPage,
            size: refundPageSize,
            search: debouncedRefundSearch.length > 0 ? debouncedRefundSearch : undefined,
            date_from: refundDateParams.date_from,
            date_to: refundDateParams.date_to,
            status:
              appliedRefundFilters.statuses.length > 0 ? appliedRefundFilters.statuses : undefined,
            refund_type:
              appliedRefundFilters.types.length > 0 ? appliedRefundFilters.types : undefined,
            refund_method:
              appliedRefundFilters.methods.length > 0 ? appliedRefundFilters.methods : undefined,
            reason_category:
              appliedRefundFilters.reasons.length > 0 ? appliedRefundFilters.reasons : undefined,
          }
        : skipToken,
    [
      currentSection,
      refundPage,
      refundPageSize,
      debouncedRefundSearch,
      refundDateParams,
      appliedRefundFilters,
    ]
  );

  const refundKpisQueryArg = React.useMemo(
    () =>
      currentSection === 'refunds'
        ? {
            date_from: refundDateParams.date_from,
            date_to: refundDateParams.date_to,
            status:
              appliedRefundFilters.statuses.length > 0 ? appliedRefundFilters.statuses : undefined,
            refund_type:
              appliedRefundFilters.types.length > 0 ? appliedRefundFilters.types : undefined,
            refund_method:
              appliedRefundFilters.methods.length > 0 ? appliedRefundFilters.methods : undefined,
            reason_category:
              appliedRefundFilters.reasons.length > 0 ? appliedRefundFilters.reasons : undefined,
          }
        : skipToken,
    [currentSection, refundDateParams, appliedRefundFilters]
  );

  const refundDetailQueryArg = React.useMemo(
    () =>
      currentSection === 'refunds' && selectedRefundId ? { refundId: selectedRefundId } : skipToken,
    [currentSection, selectedRefundId]
  );
  const creditNotesQueryArg = React.useMemo(
    () =>
      currentSection === 'credit-notes'
        ? {
            page: creditNotePage,
            size: creditNotePageSize,
            search: debouncedCreditNoteSearch.length > 0 ? debouncedCreditNoteSearch : undefined,
            status: creditNoteFilters.statuses.length > 0 ? creditNoteFilters.statuses : undefined,
            reason_category:
              creditNoteFilters.reasons.length > 0 ? creditNoteFilters.reasons : undefined,
            issued_from: creditNoteDateParams.issued_from,
            issued_to: creditNoteDateParams.issued_to,
            sort_by: creditNoteFilters.sortBy,
            sort_order: creditNoteFilters.sortOrder,
          }
        : skipToken,
    [
      currentSection,
      creditNotePage,
      creditNotePageSize,
      debouncedCreditNoteSearch,
      creditNoteFilters,
      creditNoteDateParams,
    ]
  );
  const creditNoteDetailQueryArg = React.useMemo(
    () =>
      currentSection === 'credit-notes' && selectedCreditNoteId
        ? { creditNoteId: selectedCreditNoteId }
        : skipToken,
    [currentSection, selectedCreditNoteId]
  );
  const creditNoteCandidateQueryArg = React.useMemo(
    () =>
      currentSection === 'credit-notes' && selectedCreditNoteId && applyCreditModalOpen
        ? {
            creditNoteId: selectedCreditNoteId,
            page: 1,
            size: 20,
            search: debouncedCreditCandidateSearch || undefined,
          }
        : skipToken,
    [currentSection, selectedCreditNoteId, applyCreditModalOpen, debouncedCreditCandidateSearch]
  );
  const creditNotePdfStatusQueryArg = React.useMemo(
    () =>
      currentSection === 'credit-notes' && pdfPollingCreditNoteId
        ? { creditNoteId: pdfPollingCreditNoteId }
        : skipToken,
    [currentSection, pdfPollingCreditNoteId]
  );

  const accountStatementsQueryArg = React.useMemo(
    () =>
      currentSection === 'statements' && statementMode === 'list'
        ? {
            page: statementPage,
            size: statementPageSize,
            search: debouncedStatementSearch.length > 0 ? debouncedStatementSearch : undefined,
            period_start_from: statementListQueryParams.period_start_from,
            period_start_to: statementListQueryParams.period_start_to,
            generated_from: statementListQueryParams.generated_from,
            generated_to: statementListQueryParams.generated_to,
          }
        : skipToken,
    [
      currentSection,
      statementMode,
      statementPage,
      statementPageSize,
      debouncedStatementSearch,
      statementListQueryParams,
    ]
  );
  const [debouncedStatementGenerateArgs, setDebouncedStatementGenerateArgs] = React.useState<
    AccountStatementPeriodQueryArgs | undefined
  >(undefined);

  React.useEffect(() => {
    if (!statementGeneratePeriodArgs) {
      setDebouncedStatementGenerateArgs(undefined);
      return;
    }
    const timer = window.setTimeout(() => {
      setDebouncedStatementGenerateArgs(statementGeneratePeriodArgs);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [statementGeneratePeriodArgs]);

  const accountStatementPreviewQueryArg = React.useMemo(
    () =>
      currentSection === 'statements' &&
      statementMode === 'generate' &&
      debouncedStatementGenerateArgs
        ? debouncedStatementGenerateArgs
        : skipToken,
    [currentSection, statementMode, debouncedStatementGenerateArgs]
  );

  const selectedStatementDetailQueryArg = React.useMemo(
    () =>
      currentSection === 'statements' && selectedStatementId
        ? { statementId: selectedStatementId }
        : skipToken,
    [currentSection, selectedStatementId]
  );
  const statementPdfStatusQueryArg = React.useMemo(
    () =>
      currentSection === 'statements' && pdfPollingStatementId
        ? { statementId: pdfPollingStatementId }
        : skipToken,
    [currentSection, pdfPollingStatementId]
  );

  const paymentHistoryApiDateParams = React.useMemo(() => {
    const from = paymentHistoryDateRange?.from;
    const to = paymentHistoryDateRange?.to;
    if (!from || !to) {
      return {
        payment_date_from: undefined as string | undefined,
        payment_date_to: undefined as string | undefined,
      };
    }
    return {
      payment_date_from: format(from, 'yyyy-MM-dd'),
      payment_date_to: format(to, 'yyyy-MM-dd'),
    };
  }, [paymentHistoryDateRange]);

  const paymentHistoryApiQueryFilters = React.useMemo(
    () => ({
      status:
        appliedPaymentFilters.statuses.length > 0 ? appliedPaymentFilters.statuses : undefined,
      allocation_status:
        appliedPaymentFilters.allocationStatuses.length > 0
          ? appliedPaymentFilters.allocationStatuses
          : undefined,
      provider:
        appliedPaymentFilters.providers.length > 0 ? appliedPaymentFilters.providers : undefined,
    }),
    [appliedPaymentFilters]
  );

  const paymentsHistoryQueryArg = React.useMemo(
    () =>
      currentSection === 'payment-details' && organizationId
        ? {
            organization_id: organizationId,
            page: paymentHistoryPage,
            size: paymentHistoryPageSize,
            search:
              debouncedPaymentHistorySearch.length > 0 ? debouncedPaymentHistorySearch : undefined,
            payment_date_from: paymentHistoryApiDateParams.payment_date_from,
            payment_date_to: paymentHistoryApiDateParams.payment_date_to,
            ...paymentHistoryApiQueryFilters,
          }
        : skipToken,
    [
      currentSection,
      organizationId,
      paymentHistoryPage,
      paymentHistoryPageSize,
      debouncedPaymentHistorySearch,
      paymentHistoryApiDateParams,
      paymentHistoryApiQueryFilters,
    ]
  );

  const paymentKpisQueryArg = React.useMemo(
    () =>
      currentSection === 'payment-details' && organizationId
        ? {
            organization_id: organizationId,
            payment_date_from: paymentHistoryApiDateParams.payment_date_from,
            payment_date_to: paymentHistoryApiDateParams.payment_date_to,
            ...paymentHistoryApiQueryFilters,
          }
        : skipToken,
    [currentSection, organizationId, paymentHistoryApiDateParams, paymentHistoryApiQueryFilters]
  );

  const paymentDetailQueryArg = React.useMemo(
    () =>
      currentSection === 'payment-details' && selectedPaymentHistoryId && organizationId
        ? { paymentId: selectedPaymentHistoryId, organization_id: organizationId }
        : skipToken,
    [currentSection, selectedPaymentHistoryId, organizationId]
  );

  const {
    data: invoicesRes,
    isFetching: invoicesLoading,
    isError: invoicesError,
    refetch: refetchInvoices,
  } = useGetInvoicesQuery(invoicesQueryArg);
  const { data: invoicesSummaryRes, isFetching: invoicesSummaryLoading } =
    useGetInvoicesSummaryQuery(
      {
        status: invoiceFilters.statuses.length > 0 ? invoiceFilters.statuses : undefined,
        payment_status:
          invoiceFilters.paymentStatuses.length > 0 ? invoiceFilters.paymentStatuses : undefined,
        show_draft: invoiceFilters.showDraft || undefined,
        invoiced_from: invoiceDateParams.invoiced_from,
        invoiced_to: invoiceDateParams.invoiced_to,
      },
      { skip: currentSection !== 'invoices' }
    );
  const {
    data: refundsRes,
    isFetching: refundsLoading,
    isError: refundsError,
    refetch: refetchRefunds,
  } = useGetBillingRefundsQuery(refundsQueryArg);
  const { data: refundKpis, isFetching: refundKpisLoading } =
    useGetBillingRefundKpisQuery(refundKpisQueryArg);
  const { data: refundDetailRes, isFetching: refundDetailLoading } =
    useGetBillingRefundDetailQuery(refundDetailQueryArg);
  const {
    data: creditNotesRes,
    isFetching: creditNotesLoading,
    isError: creditNotesError,
    refetch: refetchCreditNotes,
  } = useGetBillingCreditNotesQuery(creditNotesQueryArg);
  const { data: creditNoteDetail, isFetching: creditNoteDetailLoading } =
    useGetBillingCreditNoteDetailQuery(creditNoteDetailQueryArg);
  const { data: creditNoteCandidatesRes, isFetching: creditNoteCandidatesLoading } =
    useGetBillingCreditNoteInvoiceCandidatesQuery(creditNoteCandidateQueryArg);
  const eligibleCreditNoteCandidates = React.useMemo(() => {
    const items = creditNoteCandidatesRes?.items ?? [];
    const q = creditCandidateSearchInput.trim().toLowerCase();
    return items.filter((candidate) => {
      if (!invoiceCandidateHasPositiveOutstanding(candidate.outstanding_amount)) return false;
      if (!q) return true;
      return candidate.invoice_number.toLowerCase().includes(q);
    });
  }, [creditNoteCandidatesRes?.items, creditCandidateSearchInput]);
  const {
    data: statementsRes,
    isFetching: statementsFetching,
    isError: statementsError,
    refetch: refetchStatements,
  } = useGetAccountStatementsQuery(accountStatementsQueryArg);
  const [cachedStatementsRes, setCachedStatementsRes] =
    React.useState<typeof statementsRes>(undefined);
  React.useEffect(() => {
    if (statementsRes) setCachedStatementsRes(statementsRes);
  }, [statementsRes]);
  React.useEffect(() => {
    if (currentSection !== 'statements' || statementMode !== 'list') {
      setCachedStatementsRes(undefined);
    }
  }, [currentSection, statementMode]);
  const displayedStatementsRes =
    currentSection === 'statements' && statementMode === 'list'
      ? (statementsRes ?? cachedStatementsRes)
      : undefined;
  const statementsListInitialLoading =
    currentSection === 'statements' &&
    statementMode === 'list' &&
    !displayedStatementsRes &&
    statementsFetching;
  const statementsListRefreshing =
    currentSection === 'statements' &&
    statementMode === 'list' &&
    statementsFetching &&
    Boolean(displayedStatementsRes?.items?.length);
  const {
    data: statementSummary,
    isFetching: statementSummaryFetching,
    isLoading: statementSummaryLoading,
  } = useGetAccountStatementSummaryQuery(accountStatementPreviewQueryArg);
  const {
    data: statementPreview,
    isFetching: statementPreviewFetching,
    isLoading: statementPreviewLoading,
  } = useGetAccountStatementPreviewQuery(accountStatementPreviewQueryArg);
  const {
    data: selectedStatementDetail,
    isFetching: selectedStatementDetailFetching,
    isLoading: selectedStatementDetailLoading,
  } = useGetAccountStatementDetailQuery(selectedStatementDetailQueryArg);
  const [cachedStatementPreview, setCachedStatementPreview] =
    React.useState<AccountStatementPreview | null>(null);
  const [cachedStatementSummary, setCachedStatementSummary] =
    React.useState<AccountStatementSummary | null>(null);
  const [cachedStatementDetail, setCachedStatementDetail] =
    React.useState<AccountStatementDetail | null>(null);

  React.useEffect(() => {
    if (!debouncedStatementGenerateArgs) {
      setCachedStatementPreview(null);
      setCachedStatementSummary(null);
      return;
    }
    if (statementPreview) setCachedStatementPreview(statementPreview);
    if (statementSummary) setCachedStatementSummary(statementSummary);
  }, [debouncedStatementGenerateArgs, statementPreview, statementSummary]);

  React.useEffect(() => {
    if (!selectedStatementId) {
      setCachedStatementDetail(null);
      return;
    }
    if (selectedStatementDetail && selectedStatementDetail.id === selectedStatementId) {
      setCachedStatementDetail(selectedStatementDetail);
    }
  }, [selectedStatementId, selectedStatementDetail]);
  const { data: statementPdfStatus } = useGetAccountStatementPdfStatusQuery(
    statementPdfStatusQueryArg,
    { pollingInterval: pdfPollingStatementId ? 2000 : 0 }
  );
  const [generateAccountStatement, { isLoading: isGeneratingStatement }] =
    useGenerateAccountStatementMutation();
  const [requestAccountStatementPdf, { isLoading: requestStatementPdfLoading }] =
    useRequestAccountStatementPdfMutation();
  const [getStatementPdfSignedUrl, { isLoading: statementPdfUrlLoading }] =
    useGetAccountStatementPdfSignedUrlMutation();

  const { data: creditNotePdfStatus } = useGetBillingCreditNotePdfStatusQuery(
    creditNotePdfStatusQueryArg,
    { pollingInterval: 1500, skipPollingIfUnfocused: true }
  );
  const [applyCreditNoteMutation, { isLoading: applyCreditLoading }] =
    useApplyBillingCreditNoteMutation();
  const [requestPdfMutation, { isLoading: requestPdfLoading }] =
    useRequestBillingCreditNotePdfMutation();
  const [getPdfSignedUrlMutation, { isLoading: signedUrlLoading }] =
    useGetBillingCreditNotePdfSignedUrlMutation();
  const {
    data: paymentsHistoryRes,
    isFetching: paymentsHistoryFetching,
    isError: paymentsHistoryError,
    refetch: refetchPaymentsHistory,
  } = useGetBillingPaymentsHistoryQuery(paymentsHistoryQueryArg);
  const { data: paymentKpis, isFetching: paymentKpisFetching } =
    useGetBillingPaymentKpisQuery(paymentKpisQueryArg);
  const {
    data: paymentDetail,
    isFetching: paymentDetailFetching,
    isError: paymentDetailError,
    refetch: refetchPaymentDetail,
  } = useGetBillingPaymentByIdQuery(paymentDetailQueryArg);

  const paymentDetailAllocationsLoading = Boolean(
    selectedPaymentHistoryId &&
    paymentDetailFetching &&
    (!paymentDetail || paymentDetail.id !== selectedPaymentHistoryId)
  );

  const invoiceRows = React.useMemo<InvoiceListRow[]>(
    () =>
      (invoicesRes?.items ?? []).map((item: InvoiceListItem) => ({
        id: item.id,
        invoiceNumber: item.invoice_number,
        orderReference: item.order_reference ?? '-',
        issueDate: formatApiDate(item.invoiced_date),
        dueDate: formatApiDate(item.due_date),
        total: formatCurrencyAmount(item.total),
        paid: formatCurrencyAmount(item.paid),
        balance: formatCurrencyAmount(item.balance),
        status: INVOICE_PAYMENT_STATUS_LABELS[item.payment_status] ?? item.payment_status,
      })),
    [invoicesRes?.items]
  );

  const paymentHistoryTableRows = React.useMemo(
    () =>
      (paymentsHistoryRes?.items ?? []).map((item) =>
        mapBillingPaymentListItemToRow(item, item.currency ?? 'GBP')
      ),
    [paymentsHistoryRes?.items]
  );
  const totalPaymentHistoryPages = Math.max(1, paymentsHistoryRes?.pages ?? 1);
  const safePaymentHistoryPage = Math.min(
    Math.max(1, paymentHistoryPage),
    totalPaymentHistoryPages
  );

  React.useEffect(() => {
    if (currentSection !== 'payment-details') return;
    const pages = paymentsHistoryRes?.pages ?? 1;
    if (paymentHistoryPage > pages) setPaymentHistoryPage(Math.max(1, pages));
  }, [currentSection, paymentsHistoryRes?.pages, paymentHistoryPage]);

  React.useEffect(() => {
    if (currentSection !== 'statements') return;
    const pages = statementsRes?.pages ?? 1;
    if (statementPage > pages) setStatementPage(Math.max(1, pages));
  }, [currentSection, statementsRes?.pages, statementPage]);

  const selectedPaymentHistory = React.useMemo(() => {
    if (!selectedPaymentHistoryId) return null;
    const listRow = paymentHistoryTableRows.find((r) => r.id === selectedPaymentHistoryId) ?? null;
    if (!paymentDetail || paymentDetail.id !== selectedPaymentHistoryId) return listRow;
    const currency = paymentDetail.currency ?? 'GBP';
    return mergePaymentDetailIntoRow(paymentDetail, listRow, currency);
  }, [selectedPaymentHistoryId, paymentHistoryTableRows, paymentDetail]);

  const paymentDrawerCurrency = React.useMemo(() => {
    if (paymentDetail?.id === selectedPaymentHistoryId) {
      return paymentDetail.currency ?? 'GBP';
    }
    const item = paymentsHistoryRes?.items?.find((p) => p.id === selectedPaymentHistoryId);
    return item?.currency ?? 'GBP';
  }, [paymentDetail, selectedPaymentHistoryId, paymentsHistoryRes?.items]);

  const paymentHistoryQuickRangeLabel = React.useMemo(() => {
    return (
      PAYMENT_HISTORY_DATE_QUICK_OPTIONS.find((o) => o.id === paymentHistoryDatePreset)?.label ??
      'All time'
    );
  }, [paymentHistoryDatePreset]);
  const statementTableRows = React.useMemo<StatementListRow[]>(
    () =>
      (displayedStatementsRes?.items ?? []).map((item) => ({
        id: item.id,
        statementId: item.statement_number,
        period: formatStatementPeriod(item.period_start, item.period_end),
        generatedOn: item.generated_at ?? item.created_at,
        openingBalance: item.opening_balance,
        closingBalance: item.closing_balance,
      })),
    [displayedStatementsRes?.items]
  );
  const totalStatementPages = Math.max(1, displayedStatementsRes?.pages ?? 1);
  const safeStatementPage = Math.min(Math.max(1, statementPage), totalStatementPages);
  const statementListDatePresetLabel =
    STATEMENT_LIST_DATE_QUICK_OPTIONS.find((o) => o.id === statementListDatePreset)?.label ??
    'Any Date';
  const statementFromLabel = statementFromDate
    ? format(statementFromDate, 'dd MMM yyyy')
    : 'Select date';
  const statementToLabel = statementToDate ? format(statementToDate, 'dd MMM yyyy') : 'Select date';
  const statementGenerateDisabled = !statementFromDate || !statementToDate;
  const hasStatementPreviewQuery = debouncedStatementGenerateArgs != null;
  const displayedStatementSummary = hasStatementPreviewQuery
    ? (statementSummary ?? cachedStatementSummary)
    : null;
  const displayedStatementPreview = hasStatementPreviewQuery
    ? (statementPreview ?? cachedStatementPreview)
    : null;
  const statementPreviewPending = React.useMemo(() => {
    if (!statementGeneratePeriodArgs) return false;
    if (!debouncedStatementGenerateArgs) return true;
    return (
      JSON.stringify(statementGeneratePeriodArgs) !== JSON.stringify(debouncedStatementGenerateArgs)
    );
  }, [statementGeneratePeriodArgs, debouncedStatementGenerateArgs]);
  const statementPreviewInitialLoading =
    hasStatementPreviewQuery &&
    !displayedStatementPreview &&
    (statementPreviewLoading || statementPreviewFetching);
  const statementPreviewRefreshing =
    hasStatementPreviewQuery &&
    !statementPreviewInitialLoading &&
    (statementPreviewPending || statementPreviewFetching || statementSummaryFetching) &&
    Boolean(displayedStatementPreview || displayedStatementSummary);
  const statementPreviewCurrency =
    displayedStatementSummary?.currency ?? displayedStatementPreview?.ledger.currency ?? 'GBP';
  const generatedOpeningBalance = !statementGeneratePeriodArgs
    ? '-'
    : displayedStatementSummary
      ? formatCurrencyAmount(displayedStatementSummary.opening_balance, statementPreviewCurrency)
      : statementSummaryLoading
        ? '—'
        : '-';
  const generatedClosingBalance = !statementGeneratePeriodArgs
    ? '-'
    : displayedStatementSummary
      ? formatCurrencyAmount(displayedStatementSummary.closing_balance, statementPreviewCurrency)
      : statementSummaryLoading
        ? '—'
        : '-';
  const activeStatementDetail: AccountStatementDetail | null =
    selectedStatementDetail ?? cachedStatementDetail;
  const activeStatementPreview: AccountStatementPreview | null = displayedStatementPreview;
  const selectedStatementDetailInitialLoading =
    Boolean(selectedStatementId) && !activeStatementDetail && selectedStatementDetailLoading;
  const selectedStatementDetailRefreshing =
    Boolean(selectedStatementId) &&
    selectedStatementDetailFetching &&
    Boolean(activeStatementDetail);

  const refundRows = React.useMemo<RefundListRow[]>(
    () =>
      (refundsRes?.items ?? []).map((item: BillingRefundListItem) => ({
        id: item.id,
        refundNumber: item.refund_number,
        paymentNumber: item.payment_number ?? '-',
        invoiceNumber: item.invoice_number ?? '-',
        braintreeRefundId: item.braintree_transaction_id ?? '-',
        linkedBooking: item.linked_booking_ref ?? '-',
        refundDate: formatApiDate(item.refund_date),
        amount: formatCurrencyAmount(item.amount),
        reasonCategory: REFUND_REASON_CATEGORY_LABELS[item.reason_category] ?? item.reason_category,
        method: REFUND_METHOD_LABELS[item.refund_method] ?? item.refund_method,
        completionDate:
          item.status === 'COMPLETED' || item.status === 'FAILED' || item.status === 'REVERSED'
            ? formatApiDate(item.refund_date)
            : '-',
        status: REFUND_STATUS_LABELS[item.status] ?? item.status,
      })),
    [refundsRes?.items]
  );

  const selectedRefundListItem = React.useMemo(
    () => (refundsRes?.items ?? []).find((item) => item.id === selectedRefundId) ?? null,
    [refundsRes?.items, selectedRefundId]
  );
  const creditNoteRows = React.useMemo<CreditNoteListRow[]>(
    () =>
      (creditNotesRes?.items ?? []).map((item: BillingCreditNoteListItem) => ({
        id: item.id,
        creditNoteNumber: item.credit_note_number,
        issueDate: formatApiDate(item.issue_date),
        amount: formatCurrencyAmount(item.total_credit_amount),
        reasonCategory:
          CREDIT_NOTE_REASON_CATEGORY_LABELS[item.reason_category] ?? item.reason_category,
        status: CREDIT_NOTE_STATUS_LABELS[item.status] ?? item.status,
        allocatedTo: formatCreditNoteAllocatedToListItem(item),
        remaining: formatCurrencyAmount(item.remaining_amount),
      })),
    [creditNotesRes?.items]
  );
  const selectedCreditNoteListItem = React.useMemo(
    () => (creditNotesRes?.items ?? []).find((item) => item.id === selectedCreditNoteId) ?? null,
    [creditNotesRes?.items, selectedCreditNoteId]
  );

  const refundAdvancedFilterSelections =
    appliedRefundFilters.types.length + appliedRefundFilters.methods.length;

  const selectedRefund = refundDetailRes?.refund;
  const selectedRefundTitle =
    selectedRefund?.refund_number ??
    selectedRefundListItem?.refund_number ??
    selectedRefundId ??
    '-';
  const selectedCreditNoteTitle =
    creditNoteDetail?.credit_note_number ??
    selectedCreditNoteListItem?.credit_note_number ??
    selectedCreditNoteId ??
    '-';
  const selectedCreditNoteCurrency = creditNoteDetail?.currency ?? 'GBP';
  const selectedCreditTotalRaw =
    creditNoteDetail?.total_credit_amount ?? selectedCreditNoteListItem?.total_credit_amount ?? '0';
  const selectedCreditAppliedRaw =
    creditNoteDetail?.applied_amount ?? selectedCreditNoteListItem?.applied_amount ?? '0';
  const selectedCreditRemainingRaw =
    creditNoteDetail?.remaining_amount ?? selectedCreditNoteListItem?.remaining_amount ?? '0';
  const selectedCreditTotal = Number.parseFloat(selectedCreditTotalRaw) || 0;
  const selectedCreditApplied = Number.parseFloat(selectedCreditAppliedRaw) || 0;
  const selectedCreditUsedPercent =
    selectedCreditTotal > 0
      ? Math.min(100, Math.max(0, (selectedCreditApplied / selectedCreditTotal) * 100))
      : 0;

  React.useEffect(() => {
    const status = creditNotePdfStatus?.status?.toUpperCase();
    if (status === 'READY' && pdfPollingCreditNoteId) {
      void getPdfSignedUrlMutation({
        creditNoteId: pdfPollingCreditNoteId,
        disposition: 'attachment',
      })
        .unwrap()
        .then((res) => {
          if (res.signed_url) {
            openPdfDownloadUrl(res.signed_url);
            toast.success('Credit note PDF download started.');
          } else {
            toast.error('Credit note PDF link was empty. Please try again.');
          }
          setPdfPollingCreditNoteId(null);
        })
        .catch(() => {
          toast.error('Failed to fetch credit note PDF download link. Please try again.');
          setPdfPollingCreditNoteId(null);
        });
    }
    if (status === 'FAILED') setPdfPollingCreditNoteId(null);
  }, [creditNotePdfStatus?.status, pdfPollingCreditNoteId, getPdfSignedUrlMutation]);
  React.useEffect(() => {
    const status = statementPdfStatus?.status?.toUpperCase();
    if (!pdfPollingStatementId) return;
    if (status === 'READY') {
      void getStatementPdfSignedUrl({
        statementId: pdfPollingStatementId,
        disposition: 'attachment',
      })
        .unwrap()
        .then((res) => {
          if (res.url) {
            openPdfDownloadUrl(res.url);
            toast.success('Statement PDF download started.');
          }
          setPdfPollingStatementId(null);
        })
        .catch(() => {
          toast.error('Failed to fetch statement PDF download link. Please try again.');
          setPdfPollingStatementId(null);
        });
    }
    if (status === 'FAILED') {
      toast.error('Statement PDF generation failed. Please retry.');
      setPdfPollingStatementId(null);
    }
  }, [statementPdfStatus?.status, pdfPollingStatementId, getStatementPdfSignedUrl]);
  React.useEffect(() => {
    if (!applyCreditModalOpen) {
      setSelectedCandidateInvoiceId(null);
      return;
    }
    const firstCandidate = eligibleCreditNoteCandidates[0]?.invoice_id ?? null;
    if (!selectedCandidateInvoiceId && firstCandidate)
      setSelectedCandidateInvoiceId(firstCandidate);
  }, [applyCreditModalOpen, eligibleCreditNoteCandidates, selectedCandidateInvoiceId]);

  React.useEffect(() => {
    if (!applyCreditModalOpen) return;
    const allowed = new Set(eligibleCreditNoteCandidates.map((c) => c.invoice_id));
    if (selectedCandidateInvoiceId != null && !allowed.has(selectedCandidateInvoiceId)) {
      setSelectedCandidateInvoiceId(null);
    }
  }, [applyCreditModalOpen, eligibleCreditNoteCandidates, selectedCandidateInvoiceId]);

  const handleApplyCreditToInvoice = React.useCallback(async (): Promise<void> => {
    if (!selectedCreditNoteId || !selectedCandidateInvoiceId) return;
    await applyCreditNoteMutation({
      creditNoteId: selectedCreditNoteId,
      invoice_id: selectedCandidateInvoiceId,
    }).unwrap();
    setApplyCreditModalOpen(false);
    setSelectedCandidateInvoiceId(null);
  }, [selectedCreditNoteId, selectedCandidateInvoiceId, applyCreditNoteMutation]);

  const handleDownloadCreditNotePdf = React.useCallback(async (): Promise<void> => {
    if (!selectedCreditNoteId) return;
    await requestPdfMutation({ creditNoteId: selectedCreditNoteId }).unwrap();
    setPdfPollingCreditNoteId(selectedCreditNoteId);
  }, [selectedCreditNoteId, requestPdfMutation]);
  const copyToClipboard = React.useCallback(async (value: string, label: string): Promise<void> => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied.`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}.`);
    }
  }, []);
  const handleStatementListDatePreset = React.useCallback((id: StatementListDatePresetId) => {
    setStatementListDatePreset(id);
    setStatementPage(1);
    setStatementListDatePresetOpen(false);
  }, []);

  const handleOpenStatementDetail = React.useCallback((statementId: string): void => {
    setSelectedStatementId(statementId);
    setStatementPreviewOpen(true);
  }, []);

  const handleDownloadStatementPdf = React.useCallback(
    async (statementId: string, pdfStatus?: string | null): Promise<void> => {
      const normalized = pdfStatus?.toUpperCase();
      if (normalized === 'READY') {
        try {
          const res = await getStatementPdfSignedUrl({
            statementId,
            disposition: 'attachment',
          }).unwrap();
          if (res.url) openPdfDownloadUrl(res.url);
        } catch {
          toast.error('Failed to download statement PDF.');
        }
        return;
      }
      if (normalized === 'GENERATING') {
        setPdfPollingStatementId(statementId);
        return;
      }
      try {
        await requestAccountStatementPdf({ statementId }).unwrap();
        toast.success('Statement PDF request submitted. Preparing download...');
        setPdfPollingStatementId(statementId);
      } catch {
        toast.error('Could not request statement PDF. Please try again.');
      }
    },
    [getStatementPdfSignedUrl, requestAccountStatementPdf]
  );

  const handleGenerateStatement = React.useCallback(async (): Promise<void> => {
    if (!statementGeneratePeriodArgs) return;
    try {
      const created = await generateAccountStatement({
        ...statementGeneratePeriodArgs,
        idempotencyKey: crypto.randomUUID(),
      }).unwrap();
      setSelectedStatementId(created.id);
      setStatementMode('list');
      setStatementPreviewOpen(true);
      const createdPdfStatus = created.pdf_status?.toUpperCase();
      if (createdPdfStatus !== 'READY') {
        if (createdPdfStatus === 'NOT_REQUESTED' || createdPdfStatus === 'FAILED') {
          try {
            await requestAccountStatementPdf({ statementId: created.id }).unwrap();
          } catch {
            toast.error(
              'Statement saved, but PDF could not be requested. Use Download in the detail view.'
            );
          }
        }
        setPdfPollingStatementId(created.id);
      }
      toast.success('Statement has been generated successfully.');
    } catch {
      toast.error('Failed to generate statement. Please try again.');
    }
  }, [statementGeneratePeriodArgs, generateAccountStatement, requestAccountStatementPdf]);

  const renderContent = (): React.JSX.Element => {
    if (currentSection === 'refunds') {
      return (
        <div className="min-w-0 space-y-3 pt-2">
          <RefundSummaryCards kpis={refundKpis} isLoading={refundKpisLoading} />
          <RefundsFilterToolbar
            searchValue={refundSearchInput}
            onSearchChange={setRefundSearchInput}
            appliedRefundFilters={appliedRefundFilters}
            setAppliedRefundFilters={setAppliedRefundFilters}
            refundDateRange={refundDateRange}
            setRefundDateRange={setRefundDateRange}
            onOpenAdvancedFilters={() => handleFiltersOpenChange(true)}
            advancedFilterSelections={refundAdvancedFilterSelections}
          />
          <RefundsTable
            rows={refundRows}
            total={refundsRes?.total ?? 0}
            page={refundsRes?.page ?? refundPage}
            pages={refundsRes?.pages ?? 1}
            size={refundsRes?.size ?? refundPageSize}
            isLoading={refundsLoading}
            isError={refundsError}
            onRetry={() => void refetchRefunds()}
            onPageChange={setRefundPage}
            onPageSizeChange={(next) => {
              setRefundPageSize(next);
              setRefundPage(1);
            }}
            onView={(id) => setSelectedRefundId(id)}
          />
        </div>
      );
    }
    if (currentSection === 'credit-notes') {
      return (
        <div className="min-w-0 space-y-3">
          <CreditNotesFilterToolbar
            searchValue={creditNoteSearchInput}
            onSearchChange={setCreditNoteSearchInput}
            filters={creditNoteFilters}
            setFilters={setCreditNoteFilters}
            issuedDateRange={creditNoteDateRange}
            setIssuedDateRange={setCreditNoteDateRange}
          />
          <CreditNotesTable
            rows={creditNoteRows}
            total={creditNotesRes?.total ?? 0}
            page={creditNotesRes?.page ?? creditNotePage}
            pages={creditNotesRes?.pages ?? 1}
            size={creditNotesRes?.size ?? creditNotePageSize}
            isLoading={creditNotesLoading}
            isError={creditNotesError}
            onRetry={() => void refetchCreditNotes()}
            onPageChange={setCreditNotePage}
            onPageSizeChange={(next) => {
              setCreditNotePageSize(next);
              setCreditNotePage(1);
            }}
            onView={(id) => setSelectedCreditNoteId(id)}
          />
        </div>
      );
    }
    if (currentSection === 'invoices') {
      const hasActiveInvoiceFilters =
        invoiceSearchInput.trim().length > 0 ||
        invoiceFilters.statuses.length > 0 ||
        invoiceFilters.paymentStatuses.length > 0 ||
        invoiceFilters.showDraft ||
        Boolean(invoiceDateRange?.from) ||
        Boolean(invoiceDateRange?.to);
      const isTrulyEmptyInvoicesState =
        !invoicesLoading &&
        !invoicesError &&
        (invoicesRes?.total ?? 0) === 0 &&
        !hasActiveInvoiceFilters;

      return (
        <div className="min-w-0 space-y-2.5">
          <div className="pt-1">
            <InvoiceSummaryCards summary={invoicesSummaryRes} isLoading={invoicesSummaryLoading} />
          </div>
          {isTrulyEmptyInvoicesState ? (
            <NoInvoicesState />
          ) : (
            <div className="min-w-0 space-y-2.5">
              <InvoicesFilterToolbar
                searchValue={invoiceSearchInput}
                onSearchChange={setInvoiceSearchInput}
                filters={invoiceFilters}
                setFilters={setInvoiceFilters}
                invoicedDateRange={invoiceDateRange}
                setInvoicedDateRange={setInvoiceDateRange}
              />
              <InvoicesTable
                rows={invoiceRows}
                total={invoicesRes?.total ?? 0}
                page={invoicesRes?.page ?? invoicePage}
                pages={invoicesRes?.pages ?? 1}
                size={invoicesRes?.size ?? invoicePageSize}
                isLoading={invoicesLoading}
                isError={invoicesError}
                onRetry={() => void refetchInvoices()}
                onPageChange={setInvoicePage}
                onPageSizeChange={(next) => {
                  setInvoicePageSize(next);
                  setInvoicePage(1);
                }}
                onView={(id) => void navigate(`/billing/invoices/${encodeURIComponent(id)}`)}
              />
            </div>
          )}
        </div>
      );
    }
    if (currentSection === 'payment-details') {
      const filterCount =
        appliedPaymentFilters.providers.length +
        appliedPaymentFilters.statuses.length +
        appliedPaymentFilters.allocationStatuses.length;
      const hasActivePaymentFilters =
        debouncedPaymentHistorySearch.length > 0 ||
        filterCount > 0 ||
        Boolean(paymentHistoryDateRange?.from && paymentHistoryDateRange?.to);

      if (!organizationId) {
        return (
          <div className="min-w-0 space-y-3">
            <Typography className="text-sm text-[#71717A]">
              Organization context is missing, so payment history cannot be loaded.
            </Typography>
          </div>
        );
      }
      if (paymentsHistoryError) {
        return (
          <div className="min-w-0 space-y-3">
            <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
              Could not load payment history.{' '}
              <button
                type="button"
                className="font-medium underline"
                onClick={() => void refetchPaymentsHistory()}
              >
                Retry
              </button>
            </div>
          </div>
        );
      }

      const isTrulyEmptyPayments =
        !paymentsHistoryFetching &&
        !paymentsHistoryError &&
        (paymentsHistoryRes?.total ?? 0) === 0 &&
        !hasActivePaymentFilters;

      if (isTrulyEmptyPayments) {
        return (
          <div className="rounded-xl border border-[#E4E4E7] bg-white p-4">
            <div className="flex min-h-[520px] items-center justify-center rounded-[10px] border border-dashed border-[#E5E7EB] bg-[#FAFAFA]">
              <div className="flex max-w-[460px] flex-col items-center text-center">
                <img
                  src={NoPaymentHistoryIllustration}
                  alt="No payment history"
                  className="mb-4 h-[120px] w-[120px]"
                />
                <Typography className="text-[34px] font-semibold leading-tight text-[#18181B]">
                  No Account Statements
                </Typography>
                <Typography className="mt-2 text-sm text-[#71717A]">
                  Generate your first account statement to view period balances and activity.
                </Typography>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="min-w-0 space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <BillingKpiCard
              iconSrc={BillingPaymentTotalPaymentsIcon}
              label="Total Payments"
              value={
                paymentKpisFetching
                  ? '...'
                  : formatCurrencyAmount(paymentKpis?.total_payments_amount ?? '0')
              }
            />
            <BillingKpiCard
              iconSrc={BillingPaymentAllocatedIcon}
              label="Allocated"
              value={
                paymentKpisFetching
                  ? '...'
                  : formatCurrencyAmount(paymentKpis?.allocated_amount ?? '0')
              }
            />
            <BillingKpiCard
              iconSrc={BillingPaymentUnallocatedIcon}
              label="Unallocated"
              value={
                paymentKpisFetching
                  ? '...'
                  : formatCurrencyAmount(paymentKpis?.unallocated_amount ?? '0')
              }
            />
            <BillingKpiCard
              iconSrc={BillingPaymentPendingIcon}
              label="Pending"
              value={
                paymentKpisFetching
                  ? '...'
                  : formatCurrencyAmount(paymentKpis?.pending_amount ?? '0')
              }
            />
          </div>
          <div className="flex min-w-0 flex-nowrap items-center gap-3 overflow-x-auto">
            <Input
              value={paymentHistorySearchInput}
              onChange={(e) => setPaymentHistorySearchInput(e.target.value)}
              placeholder="Search payment ID or invoice (e.g. INV-1051)"
              leftIcon={Search}
              className="h-10 min-w-[220px] flex-1 border-[#E4E4E7]"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    BILLING_TOOLBAR_TRIGGER_CLASS,
                    'min-w-[200px] max-w-[min(100%,280px)] shrink-0'
                  )}
                >
                  <CalendarDays className="size-4 shrink-0 text-[#A1A1AA]" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-left">
                    {paymentHistoryQuickRangeLabel}
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-[#A1A1AA]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="min-w-[var(--radix-dropdown-menu-trigger-width)]"
              >
                {PAYMENT_HISTORY_DATE_QUICK_OPTIONS.map((o) => (
                  <DropdownMenuItem
                    key={o.id}
                    onSelect={() => handlePaymentHistoryQuickRange(o.id)}
                    className="flex cursor-pointer items-center justify-between gap-3 py-2.5 pl-3 pr-2 text-sm"
                  >
                    <span className="min-w-0 flex-1 truncate">{o.label}</span>
                    {paymentHistoryDatePreset === o.id ? (
                      <Check className="size-4 shrink-0 text-[#BE1E2D]" aria-hidden />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              type="button"
              variant="outline"
              className={cn(BILLING_TOOLBAR_TRIGGER_CLASS, 'min-w-[132px]')}
              onClick={() => handlePaymentFiltersOpenChange(true)}
            >
              <SlidersHorizontal className="size-4 shrink-0 text-[#71717A]" aria-hidden />
              <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
                Filter
                {filterCount > 0 ? (
                  <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#BE1E2D] px-1.5 text-[11px] font-medium leading-none text-white">
                    {filterCount}
                  </span>
                ) : null}
              </span>
            </Button>
          </div>
          <div className="rounded-lg border border-[#E4E4E7] p-3">
            <div className="overflow-x-auto pb-1">
              <Table className="min-w-[1080px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Allocated To</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Allocation Status</TableHead>
                    <TableHead>View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentsHistoryFetching && paymentHistoryTableRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-10 text-center text-sm text-[#71717A]">
                        Loading payments…
                      </TableCell>
                    </TableRow>
                  ) : paymentHistoryTableRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-10 text-center text-sm text-[#71717A]">
                        No payments found for the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paymentHistoryTableRows.map((row) => (
                      <TableRow key={row.id} className="h-14">
                        <TableCell className="font-medium text-[#52525B] underline">
                          {row.paymentId}
                        </TableCell>
                        <TableCell>{formatApiDate(row.paymentDate)}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              'border-0',
                              getPaymentMethodBadgeClass(row.paymentMethod)
                            )}
                          >
                            {row.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrencyAmount(row.amount)}</TableCell>
                        <TableCell>
                          <Badge className={cn('border-0', getPaymentStatusBadgeClass(row.status))}>
                            {PAYMENT_HISTORY_STATUS_LABELS[row.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-pre-line underline">
                          {row.allocatedTo}
                        </TableCell>
                        <TableCell className="whitespace-pre-line">{row.remaining}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              'border-0',
                              getPaymentAllocationStatusBadgeClass(row.allocationStatus)
                            )}
                          >
                            {PAYMENT_ALLOCATION_STATUS_LABELS[row.allocationStatus]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            className="inline-flex items-center text-[#71717A]"
                            onClick={() => setSelectedPaymentHistoryId(row.id)}
                          >
                            <ArrowUpRight className="size-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-3 flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-sm text-[#52525B]">
                <span>Show</span>
                <select
                  className="h-8 rounded border border-[#E4E4E7] px-2"
                  value={String(paymentHistoryPageSize)}
                  onChange={(e) => setPaymentHistoryPageSize(Number(e.target.value))}
                >
                  <option value="8">08</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span>entries out of {paymentsHistoryRes?.total ?? 0}</span>
              </div>
              <Pagination
                currentPage={safePaymentHistoryPage}
                totalPages={totalPaymentHistoryPages}
                onPageChange={setPaymentHistoryPage}
              />
            </div>
          </div>
          <Dialog open={paymentFiltersOpen} onOpenChange={handlePaymentFiltersOpenChange}>
            <DialogContent className="grid h-auto max-h-[90vh] max-w-[760px] gap-0 overflow-hidden rounded-xl border border-[#E3E5EC] bg-[#FAFAFC] p-0 sm:h-auto">
              <DialogHeader className="shrink-0 space-y-1 border-b border-[#E4E4EA] px-6 pb-3 pt-5 text-left">
                <DialogTitle className="text-xl font-normal text-[#1A1A1A]">Filters</DialogTitle>
                <DialogDescription className="sr-only">
                  Filter payment history by method, allocation status, and payment status.
                </DialogDescription>
              </DialogHeader>
              <div className="flex max-h-[min(72vh,calc(90vh-8rem))] flex-col gap-5 overflow-y-auto px-6 pb-5 pt-4">
                <RefundFilterChipSection<BillingPaymentHistoryProvider>
                  title="Select Provider:"
                  options={PAYMENT_HISTORY_FILTER_PROVIDER_OPTIONS}
                  selected={paymentFilterDraft.providers}
                  onToggle={(v) => togglePaymentFilter('providers', v)}
                />
                <RefundFilterChipSection<BillingPaymentHistoryAllocationStatus>
                  title="Select Allocation Status:"
                  options={PAYMENT_HISTORY_FILTER_ALLOCATION_OPTIONS}
                  selected={paymentFilterDraft.allocationStatuses}
                  onToggle={(v) => togglePaymentFilter('allocationStatuses', v)}
                />
                <RefundFilterChipSection<BillingPaymentHistoryStatus>
                  title="Select Status:"
                  options={PAYMENT_HISTORY_FILTER_STATUS_OPTIONS}
                  selected={paymentFilterDraft.statuses}
                  onToggle={(v) => togglePaymentFilter('statuses', v)}
                  showDivider={false}
                />
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E4EA] pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-white"
                    onClick={resetPaymentFilterDraft}
                  >
                    Reset Filters
                  </Button>
                  <Button
                    type="button"
                    className="bg-[#BE1E2D] text-white hover:bg-[#A21926]"
                    onClick={applyPaymentFilters}
                  >
                    Apply Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    }
    if (statementMode === 'generate') {
      return (
        <div className="min-w-0">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1.2fr]">
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-4">
              <Typography className="mb-3 text-[34px] font-semibold leading-none text-[#18181B]">
                Generate Statement
              </Typography>
              <div className="space-y-3 rounded-lg border border-[#E4E4E7] p-3">
                <Typography className="text-sm font-semibold text-[#18181B]">Date Range</Typography>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <Typography className="text-xs text-[#71717A]">From</Typography>
                    <Popover open={statementFromOpen} onOpenChange={setStatementFromOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-10 w-full justify-between border-[#E4E4E7] font-normal text-[#18181B]"
                        >
                          {statementFromLabel}
                          <CalendarDays className="size-4 text-[#A1A1AA]" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={statementFromDate}
                          onSelect={(next) => {
                            setStatementFromDate(next);
                            setStatementFromOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1">
                    <Typography className="text-xs text-[#71717A]">To</Typography>
                    <Popover open={statementToOpen} onOpenChange={setStatementToOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-10 w-full justify-between border-[#E4E4E7] font-normal text-[#18181B]"
                        >
                          {statementToLabel}
                          <CalendarDays className="size-4 text-[#A1A1AA]" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={statementToDate}
                          onSelect={(next) => {
                            setStatementToDate(next);
                            setStatementToOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-2 border-t border-[#E4E4E7] pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography className="text-sm text-[#18181B]">
                        Include Line Item Detail
                      </Typography>
                      <Typography className="text-xs text-[#A1A1AA]">
                        Full breakdown per invoice
                      </Typography>
                    </div>
                    <Switch
                      checked={includeLineItemDetail}
                      onCheckedChange={setIncludeLineItemDetail}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography className="text-sm text-[#18181B]">
                        Include Credit Notes
                      </Typography>
                      <Typography className="text-xs text-[#A1A1AA]">
                        Credit notes in the period
                      </Typography>
                    </div>
                    <Switch checked={includeCreditNotes} onCheckedChange={setIncludeCreditNotes} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography className="text-sm text-[#18181B]">
                        Include Payment History
                      </Typography>
                      <Typography className="text-xs text-[#A1A1AA]">
                        Payments received in range
                      </Typography>
                    </div>
                    <Switch
                      checked={includePaymentHistory}
                      onCheckedChange={setIncludePaymentHistory}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-[#E4E4E7] pt-3">
                  <Card
                    className={cn(
                      'border-[#E4E4E7] shadow-none transition-opacity',
                      statementPreviewRefreshing && 'opacity-70'
                    )}
                  >
                    <CardContent className="p-3">
                      <Typography className="text-xs text-[#2563EB]">
                        {statementPreviewCurrency}
                      </Typography>
                      <Typography className="text-xs text-[#71717A]">Opening Balance</Typography>
                      <Typography className="mt-1 text-[34px] font-semibold leading-none text-[#18181B]">
                        {generatedOpeningBalance}
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card
                    className={cn(
                      'border-[#E4E4E7] shadow-none transition-opacity',
                      statementPreviewRefreshing && 'opacity-70'
                    )}
                  >
                    <CardContent className="p-3">
                      <Typography className="text-xs text-[#2563EB]">
                        {statementPreviewCurrency}
                      </Typography>
                      <Typography className="text-xs text-[#71717A]">Closing Balance</Typography>
                      <Typography className="mt-1 text-[34px] font-semibold leading-none text-[#18181B]">
                        {generatedClosingBalance}
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex items-center justify-between border-t border-[#E4E4E7] pt-3">
                  <Button variant="outline" onClick={() => setStatementMode('list')}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#BE1E2D] text-white hover:bg-[#A21926]"
                    disabled={statementGenerateDisabled || isGeneratingStatement}
                    onClick={() => void handleGenerateStatement()}
                  >
                    {isGeneratingStatement ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                        Generating…
                      </>
                    ) : (
                      'Generate Statement'
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-4">
              <AccountStatementGeneratePreview
                fromDate={statementFromDate}
                toDate={statementToDate}
                hasPeriod={Boolean(statementGeneratePeriodArgs)}
                isInitialLoading={statementPreviewInitialLoading}
                isRefreshing={statementPreviewRefreshing}
                preview={activeStatementPreview}
                summary={displayedStatementSummary}
              />
            </div>
          </div>
        </div>
      );
    }

    const isTrulyEmptyStatementsState =
      !statementsListInitialLoading &&
      !statementsFetching &&
      !statementsError &&
      (displayedStatementsRes?.total ?? 0) === 0 &&
      debouncedStatementSearch.length === 0 &&
      statementListDatePreset === 'all' &&
      !statementPeriodDateRange?.from;
    const showStatementsTable =
      !isTrulyEmptyStatementsState ||
      debouncedStatementSearch.length > 0 ||
      statementListDatePreset !== 'all' ||
      Boolean(statementPeriodDateRange?.from);
    const hasStatements = showStatementsTable;
    return (
      <div className="min-w-0 space-y-3">
        <div className="flex items-center justify-end gap-2">
          <Button
            className="bg-[#BE1E2D] text-white hover:bg-[#A21926]"
            onClick={() => setStatementMode('generate')}
          >
            + Generate Statement
          </Button>
          <Popover open={statementListDatePresetOpen} onOpenChange={setStatementListDatePresetOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(BILLING_TOOLBAR_TRIGGER_CLASS, 'min-w-[130px]')}
              >
                {statementListDatePresetLabel}
                <ChevronDown className="size-4 text-[#A1A1AA]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2" align="end">
              {STATEMENT_LIST_DATE_QUICK_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={cn(
                    'flex w-full rounded-md px-2 py-2 text-left text-sm text-[#52525B] hover:bg-[#FAFAFA]',
                    statementListDatePreset === opt.id && 'bg-[#FAFAFA] font-medium'
                  )}
                  onClick={() => handleStatementListDatePreset(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
        {hasStatements ? (
          <>
            <div className="flex min-w-0 flex-nowrap items-center gap-3 overflow-x-auto">
              <Input
                value={statementSearchInput}
                onChange={(e) => setStatementSearchInput(e.target.value)}
                placeholder="Search by statement id..."
                leftIcon={Search}
                className="h-10 min-w-[220px] flex-1 border-[#E4E4E7]"
              />
              <Popover
                open={statementListDatePresetOpen}
                onOpenChange={setStatementListDatePresetOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(BILLING_TOOLBAR_TRIGGER_CLASS, 'min-w-[120px]')}
                  >
                    {statementListDatePresetLabel}
                    <ChevronDown className="size-4 text-[#A1A1AA]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-2" align="start">
                  {STATEMENT_LIST_DATE_QUICK_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={cn(
                        'flex w-full rounded-md px-2 py-2 text-left text-sm text-[#52525B] hover:bg-[#FAFAFA]',
                        statementListDatePreset === opt.id && 'bg-[#FAFAFA] font-medium'
                      )}
                      onClick={() => handleStatementListDatePreset(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
              <Popover open={statementDatePickerOpen} onOpenChange={setStatementDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      BILLING_TOOLBAR_TRIGGER_CLASS,
                      'min-w-[220px] max-w-[min(100%,340px)]'
                    )}
                  >
                    <CalendarDays className="size-4 shrink-0 text-[#A1A1AA]" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-right">
                      {statementPeriodDateRange?.from && statementPeriodDateRange.to
                        ? `${format(statementPeriodDateRange.from, 'd MMM yyyy')} – ${format(statementPeriodDateRange.to, 'd MMM yyyy')}`
                        : 'Any Date'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={statementPeriodDateRange}
                    onSelect={(next) => {
                      setStatementPeriodDateRange(next);
                      if (next?.from && next?.to) setStatementDatePickerOpen(false);
                    }}
                    numberOfMonths={2}
                    initialFocus
                  />
                  <div className="flex items-center justify-end border-t border-[#F4F4F5] px-3 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-[#71717A]"
                      onClick={() => setStatementPeriodDateRange(undefined)}
                    >
                      Clear
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div
              className={cn(
                'rounded-lg border border-[#E4E4E7] p-3 transition-opacity duration-200',
                statementsListRefreshing && 'opacity-70'
              )}
            >
              <div className="overflow-x-auto pb-1">
                <Table className="min-w-[980px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Statement ID</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Generated on</TableHead>
                      <TableHead>Opening Balance</TableHead>
                      <TableHead>Closing Balance</TableHead>
                      <TableHead>View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statementsListInitialLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-sm text-[#71717A]">
                          Loading account statements…
                        </TableCell>
                      </TableRow>
                    ) : statementsError ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center">
                          <div className="space-y-3">
                            <Typography className="text-sm text-[#71717A]">
                              Could not load account statements.
                            </Typography>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void refetchStatements()}
                            >
                              Retry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : statementTableRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-sm text-[#71717A]">
                          No statements found for the current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      statementTableRows.map((row) => (
                        <TableRow key={row.id} className="h-14">
                          <TableCell className="font-medium text-[#52525B]">
                            {row.statementId}
                          </TableCell>
                          <TableCell>{row.period}</TableCell>
                          <TableCell>{formatApiDate(row.generatedOn)}</TableCell>
                          <TableCell>{formatCurrencyAmount(row.openingBalance)}</TableCell>
                          <TableCell>{formatCurrencyAmount(row.closingBalance)}</TableCell>
                          <TableCell>
                            <button
                              type="button"
                              className="inline-flex items-center text-[#71717A]"
                              onClick={() => handleOpenStatementDetail(row.id)}
                              aria-label={`View statement ${row.statementId}`}
                            >
                              <ChevronRight className="size-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-sm text-[#52525B]">
                  <span>Show</span>
                  <select
                    className="h-8 rounded border border-[#E4E4E7] px-2"
                    value={String(statementPageSize)}
                    onChange={(e) => setStatementPageSize(Number(e.target.value))}
                  >
                    <option value="8">08</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                  <span>entries out of {statementsRes?.total ?? 0}</span>
                </div>
                <Pagination
                  currentPage={safeStatementPage}
                  totalPages={totalStatementPages}
                  onPageChange={setStatementPage}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-[#E4E4E7] bg-white p-4">
            <div className="flex min-h-[520px] items-center justify-center rounded-[10px] border border-dashed border-[#E5E7EB] bg-[#FAFAFA]">
              <div className="flex max-w-[460px] flex-col items-center text-center">
                <img
                  src={NoPaymentHistoryIllustration}
                  alt="No payment history"
                  className="mb-4 h-[120px] w-[120px]"
                />
                <Typography className="text-[34px] font-semibold leading-tight text-[#18181B]">
                  No Account Statements
                </Typography>
                <Typography className="mt-2 text-sm text-[#71717A]">
                  Generate your first account statement to view period balances and activity.
                </Typography>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-w-0 space-y-2.5">
      <div className="flex items-center gap-2 text-xs text-[#71717A]">
        <button type="button" onClick={() => void navigate('/billing/invoices')}>
          Billings
        </button>
        <ChevronRight className="size-3" />
        <span>{meta.title}</span>
        {currentSection === 'statements' && statementMode === 'generate' ? (
          <>
            <ChevronRight className="size-3" />
            <span>Generate Statement</span>
          </>
        ) : null}
      </div>

      {currentSection === 'statements' && statementMode === 'generate' ? null : (
        <div className="space-y-2">
          <Typography className="text-[34px] font-semibold leading-none text-[#111827]">
            {meta.title}
          </Typography>
          <Typography className="text-sm text-[#71717A]">{meta.subtitle}</Typography>
        </div>
      )}

      {renderContent()}

      <Dialog open={filtersOpen} onOpenChange={handleFiltersOpenChange}>
        <DialogContent className="grid h-auto max-h-[90vh] max-w-[760px] gap-0 overflow-hidden rounded-xl border border-[#E3E5EC] bg-[#FAFAFC] p-0 sm:h-auto">
          <DialogHeader className="shrink-0 space-y-1 border-b border-[#E4E4EA] px-6 pb-3 pt-5 text-left">
            <DialogTitle className="text-xl font-normal text-[#1A1A1A]">Filters</DialogTitle>
            <DialogDescription className="sr-only">
              Filter refunds by type, method, status, and reason category.
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[min(72vh,calc(90vh-8rem))] flex-col gap-5 overflow-y-auto px-6 pb-5 pt-4">
            <RefundFilterChipSection<BillingRefundType>
              title="Select Refund Type:"
              options={REFUND_FILTER_TYPE_OPTIONS}
              selected={refundFilterDraft.types}
              onToggle={(v) => toggleRefundFilter('types', v)}
            />
            <RefundFilterChipSection<BillingRefundMethod>
              title="Select Method:"
              options={REFUND_FILTER_METHOD_OPTIONS}
              selected={refundFilterDraft.methods}
              onToggle={(v) => toggleRefundFilter('methods', v)}
            />
            <RefundFilterChipSection<BillingRefundStatus>
              title="Select Status:"
              options={REFUND_FILTER_STATUS_OPTIONS}
              selected={refundFilterDraft.statuses}
              onToggle={(v) => toggleRefundFilter('statuses', v)}
            />
            <RefundFilterChipSection<BillingRefundReasonCategory>
              title="Select Reason Category:"
              options={REFUND_FILTER_REASON_OPTIONS}
              selected={refundFilterDraft.reasons}
              onToggle={(v) => toggleRefundFilter('reasons', v)}
              showDivider={false}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E4EA] pt-4">
              <Button
                type="button"
                variant="outline"
                className="bg-white"
                onClick={resetRefundModalDraft}
              >
                Reset Filters
              </Button>
              <Button
                type="button"
                className="bg-[#BE1E2D] text-white hover:bg-[#A21926]"
                onClick={applyRefundFilters}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {currentSection === 'statements' ? (
        <AccountStatementDetailOverlay
          open={statementPreviewOpen}
          statementId={selectedStatementId}
          detail={activeStatementDetail}
          isLoading={selectedStatementDetailInitialLoading}
          isRefreshing={selectedStatementDetailRefreshing}
          isDownloading={
            requestStatementPdfLoading ||
            statementPdfUrlLoading ||
            pdfPollingStatementId === selectedStatementId
          }
          onClose={() => {
            setStatementPreviewOpen(false);
            setSelectedStatementId(null);
          }}
          onDownload={() => {
            if (selectedStatementId) {
              void handleDownloadStatementPdf(
                selectedStatementId,
                activeStatementDetail?.pdf_status ?? null
              );
            }
          }}
        />
      ) : null}

      {currentSection === 'payment-details' && selectedPaymentHistory ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-[520px] border-l border-[#E4E4E7] bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#E4E4E7] px-5 py-5">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setSelectedPaymentHistoryId(null)}
              >
                <ArrowLeft className="size-4 text-[#3F3F46]" />
              </Button>
              <Typography className="text-[34px] font-semibold leading-none text-[#111827]">
                #{selectedPaymentHistory.paymentId}
              </Typography>
              <button
                type="button"
                className="inline-flex items-center rounded-sm text-[#A1A1AA] hover:text-[#71717A]"
                onClick={() => void copyToClipboard(selectedPaymentHistory.paymentId, 'Payment ID')}
                aria-label="Copy payment ID"
              >
                <Copy className="size-4" />
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto px-5 py-5">
              {paymentDetailAllocationsLoading ? (
                <div className="flex items-center gap-2 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-2.5 text-sm text-[#52525B]">
                  <Loader2 className="size-4 shrink-0 animate-spin text-[#71717A]" aria-hidden />
                  <span>Loading payment details and allocations…</span>
                </div>
              ) : null}
              {paymentDetailError ? (
                <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5 text-sm text-[#B91C1C]">
                  <span>Could not load full payment details.</span>{' '}
                  <button
                    type="button"
                    className="font-medium underline"
                    onClick={() => void refetchPaymentDetail()}
                  >
                    Retry
                  </button>
                </div>
              ) : null}
              {selectedPaymentHistory.warning ? (
                <div
                  className={cn(
                    'flex gap-3 rounded-md border px-3 py-2.5 text-sm',
                    selectedPaymentHistory.warning.tone === 'danger'
                      ? 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]'
                      : 'border-[#D4D4D8] bg-[#F5F5F5] text-[#3F3F46]'
                  )}
                  role="status"
                >
                  {selectedPaymentHistory.warning.tone === 'danger' ? (
                    <Info className="mt-0.5 size-5 shrink-0 text-[#DC2626]" aria-hidden />
                  ) : (
                    <Ban className="mt-0.5 size-5 shrink-0 text-[#71717A]" aria-hidden />
                  )}
                  <div className="min-w-0">
                    <Typography className="font-semibold">
                      {selectedPaymentHistory.warning.title}
                    </Typography>
                    <Typography className="mt-1 text-xs leading-relaxed">
                      {selectedPaymentHistory.warning.message}
                    </Typography>
                  </div>
                </div>
              ) : null}
              <DrawerDetailRow
                label="Status"
                value={
                  <Badge
                    className={cn(
                      'border-0',
                      getPaymentStatusBadgeClass(selectedPaymentHistory.status)
                    )}
                  >
                    {PAYMENT_HISTORY_STATUS_LABELS[selectedPaymentHistory.status]}
                  </Badge>
                }
                icon={Info}
              />
              <DrawerDetailRow
                label="Payment Date"
                value={formatApiDate(selectedPaymentHistory.paymentDate)}
                icon={CalendarDays}
              />
              <DrawerDetailRow
                label="Payment Method"
                value={selectedPaymentHistory.paymentMethod}
                icon={ReceiptText}
              />
              <DrawerDetailRow
                label="Bank Reference"
                value={selectedPaymentHistory.bankReference}
                icon={Hash}
              />
              {paymentDetail?.id === selectedPaymentHistory.id &&
              (paymentDetail.recorded_by?.trim() || paymentDetail.recorded_by_id) ? (
                <DrawerDetailRow
                  label="Recorded by"
                  value={
                    paymentDetail.recorded_by?.trim() ||
                    paymentDetail.recorded_by_id ||
                    selectedPaymentHistory.recordedBy ||
                    '—'
                  }
                  icon={UserRound}
                />
              ) : selectedPaymentHistory.recordedBy ? (
                <DrawerDetailRow
                  label="Recorded by"
                  value={selectedPaymentHistory.recordedBy}
                  icon={UserRound}
                />
              ) : null}
              {paymentDetail?.id === selectedPaymentHistory.id && paymentDetail.notes?.trim() ? (
                <DrawerDetailRow
                  label="Payment notes"
                  value={
                    <span className="whitespace-pre-wrap text-sm text-[#3F3F46]">
                      {paymentDetail.notes}
                    </span>
                  }
                  icon={ReceiptText}
                />
              ) : null}
              <div className="grid grid-cols-3 gap-2">
                <Card className="border-[#E4E4E7] shadow-none">
                  <CardContent className="p-3">
                    <Typography className="text-xs text-[#A1A1AA]">Payment Total Amount</Typography>
                    <Typography className="mt-1 text-[30px] font-semibold leading-none text-[#18181B]">
                      {formatCurrencyAmount(selectedPaymentHistory.amount, paymentDrawerCurrency)}
                    </Typography>
                  </CardContent>
                </Card>
                <Card className="border-[#E4E4E7] shadow-none">
                  <CardContent className="p-3">
                    <Typography className="text-xs text-[#A1A1AA]">Allocated</Typography>
                    <Typography className="mt-1 text-[30px] font-semibold leading-none text-[#18181B]">
                      {paymentDetail?.id === selectedPaymentHistory.id &&
                      paymentDetail?.allocated_amount != null &&
                      String(paymentDetail.allocated_amount).trim() !== ''
                        ? formatCurrencyAmount(
                            paymentDetail.allocated_amount,
                            paymentDrawerCurrency
                          )
                        : selectedPaymentHistory.allocationStatus === 'UNALLOCATED'
                          ? '-'
                          : formatCurrencyAmount(
                              selectedPaymentHistory.amount,
                              paymentDrawerCurrency
                            )}
                    </Typography>
                  </CardContent>
                </Card>
                <Card className="border-[#E4E4E7] shadow-none">
                  <CardContent className="p-3">
                    <Typography className="text-xs text-[#A1A1AA]">Unallocated</Typography>
                    <Typography className="mt-1 text-[30px] font-semibold leading-none text-[#18181B]">
                      {paymentDetail?.id === selectedPaymentHistory.id &&
                      paymentDetail?.unallocated_amount != null &&
                      String(paymentDetail.unallocated_amount).trim() !== ''
                        ? formatCurrencyAmount(
                            paymentDetail.unallocated_amount,
                            paymentDrawerCurrency
                          )
                        : selectedPaymentHistory.remaining.split('\n')[0]}
                    </Typography>
                  </CardContent>
                </Card>
              </div>
              <div className="h-5 overflow-hidden rounded-[4px] bg-[#EEF2FF]">
                <div className="h-full bg-[repeating-linear-gradient(-55deg,#4ADE80,#4ADE80_8px,#22C55E_8px,#22C55E_16px)]" />
              </div>
              <div className="rounded-lg border border-[#E4E4E7]">
                <div className="border-b border-[#E4E4E7] px-3 py-2">
                  <Typography className="text-sm font-semibold text-[#18181B]">
                    Allocation breakdown
                  </Typography>
                  <Typography className="mt-0.5 text-xs font-normal text-[#71717A]">
                    Per-invoice allocations from the billing API (invoice number shown when
                    provided).
                  </Typography>
                </div>
                <div className="overflow-x-auto">
                  <Table className="min-w-[820px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead className="text-right">Invoice total</TableHead>
                        <TableHead className="text-right">Allocated</TableHead>
                        <TableHead className="text-right">Remaining</TableHead>
                        <TableHead className="text-center">Revision</TableHead>
                        <TableHead>Recorded</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentDetailAllocationsLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="py-10">
                            <div className="flex flex-col items-center justify-center gap-2 text-sm text-[#71717A]">
                              <Loader2 className="size-6 animate-spin text-[#A1A1AA]" aria-hidden />
                              <span>Loading allocation breakdown…</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : selectedPaymentHistory.allocationBreakdown.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="py-6 text-center text-sm text-[#71717A]"
                          >
                            No allocations on this payment yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedPaymentHistory.allocationBreakdown.map((item) => (
                          <TableRow key={item.rowKey}>
                            <TableCell className="max-w-[200px] truncate font-mono text-[13px] text-[#52525B]">
                              {item.invoiceLabel}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {item.totalDisplay}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-medium text-[#18181B]">
                              {item.allocated}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {item.remainingDisplay}
                            </TableCell>
                            <TableCell className="text-center tabular-nums text-[#52525B]">
                              {item.revisionDisplay}
                            </TableCell>
                            <TableCell className="text-[#52525B]">{item.recordedOn}</TableCell>
                            <TableCell className="max-w-[220px] whitespace-pre-wrap text-sm text-[#52525B]">
                              {item.notesLine}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {paymentDetail?.id === selectedPaymentHistory.id &&
              paymentDetail.remittance_advice?.original_filename ? (
                <div className="rounded-lg border border-[#E4E4E7] p-3">
                  <Typography className="text-sm font-semibold text-[#18181B]">
                    Remittance advice
                  </Typography>
                  <Typography className="mt-1 text-sm text-[#52525B]">
                    {paymentDetail.remittance_advice.original_filename}
                  </Typography>
                  <Typography className="mt-1 text-xs text-[#71717A]">
                    {[
                      paymentDetail.remittance_advice.content_type,
                      formatRemittanceFileSize(paymentDetail.remittance_advice.size_bytes),
                      paymentDetail.remittance_advice.uploaded_at
                        ? formatApiDate(
                            paymentDetail.remittance_advice.uploaded_at.slice(0, 10) || ''
                          )
                        : null,
                    ]
                      .filter((part) => part != null && String(part).trim() !== '')
                      .join(' · ')}
                  </Typography>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {currentSection === 'refunds' && selectedRefundId ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/20">
          <div className="h-full w-full max-w-[470px] border-l border-[#E4E4E7] bg-white">
            <div className="flex items-center gap-3 border-b border-[#E4E4E7] px-5 py-5">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setSelectedRefundId(null)}
              >
                <ArrowLeft className="size-4 text-[#3F3F46]" />
              </Button>
              <Typography className="text-[40px] font-semibold leading-none text-[#111827]">
                #{selectedRefundTitle}
              </Typography>
              <Copy className="size-4 text-[#A1A1AA]" />
            </div>
            <div className="space-y-3 px-5 py-5">
              {refundDetailLoading && !selectedRefund ? (
                <Typography className="py-6 text-sm text-[#71717A]">
                  Loading refund details...
                </Typography>
              ) : (
                <>
                  <DrawerDetailRow
                    label="Payment ID"
                    value={
                      selectedRefund?.billing_payment_id ??
                      selectedRefundListItem?.payment_number ??
                      '-'
                    }
                    icon={Hash}
                  />
                  <DrawerDetailRow
                    label="Invoice ID"
                    value={
                      selectedRefund?.invoice_id ?? selectedRefundListItem?.invoice_number ?? '-'
                    }
                    icon={Hash}
                  />
                  <DrawerDetailRow
                    label="Braintree Refund ID"
                    value={selectedRefund?.braintree_transaction_id ?? '-'}
                    icon={Hash}
                  />
                  <DrawerDetailRow
                    label="Linked Booking"
                    value={
                      selectedRefund?.linked_booking_ref ??
                      selectedRefundListItem?.linked_booking_ref ??
                      '-'
                    }
                    icon={Hash}
                  />
                  <DrawerDetailRow
                    label="Refund Date"
                    value={formatApiDate(
                      selectedRefund?.initiated_at ?? selectedRefundListItem?.refund_date
                    )}
                    icon={CalendarDays}
                  />
                  <DrawerDetailRow
                    label="Amount"
                    value={formatCurrencyAmount(
                      selectedRefund?.requested_amount ?? selectedRefundListItem?.amount ?? '0.00',
                      selectedRefund?.currency ?? 'GBP'
                    )}
                    icon={ReceiptText}
                  />
                  <DrawerDetailRow
                    label="Refund Type"
                    value={
                      <Badge
                        className={cn(
                          'border-0',
                          getBadgeClass(
                            selectedRefund ? REFUND_TYPE_LABELS[selectedRefund.refund_type] : '-'
                          )
                        )}
                      >
                        {selectedRefund ? REFUND_TYPE_LABELS[selectedRefund.refund_type] : '-'}
                      </Badge>
                    }
                    icon={CheckCircle2}
                  />
                  <DrawerDetailRow
                    label="Method"
                    value={
                      <Badge
                        className={cn(
                          'border-0',
                          getBadgeClass(
                            selectedRefund
                              ? REFUND_METHOD_LABELS[selectedRefund.refund_method]
                              : '-'
                          )
                        )}
                      >
                        {selectedRefund ? REFUND_METHOD_LABELS[selectedRefund.refund_method] : '-'}
                      </Badge>
                    }
                    icon={CheckCircle2}
                  />
                  <DrawerDetailRow
                    label="Status"
                    value={
                      <Badge
                        className={cn(
                          'border-0',
                          getBadgeClass(
                            selectedRefund ? REFUND_STATUS_LABELS[selectedRefund.status] : '-'
                          )
                        )}
                      >
                        {selectedRefund ? REFUND_STATUS_LABELS[selectedRefund.status] : '-'}
                      </Badge>
                    }
                    icon={CheckCircle2}
                  />
                  <DrawerDetailRow
                    label="Reason Category"
                    value={
                      selectedRefund
                        ? REFUND_REASON_CATEGORY_LABELS[selectedRefund.reason_category]
                        : '-'
                    }
                    icon={ReceiptText}
                  />
                  <DrawerDetailRow
                    label="Reason Description"
                    value={
                      <span className="max-w-[220px] text-right leading-5 text-[#111827]">
                        {selectedRefund?.reason_description ?? '-'}
                      </span>
                    }
                    icon={ReceiptText}
                    alignStart
                  />
                  <DrawerDetailRow
                    label="Completion Date"
                    value={formatApiDate(
                      selectedRefund?.braintree_status_updated_at ?? selectedRefund?.updated_at
                    )}
                    icon={CalendarDays}
                  />
                  <DrawerDetailRow
                    label="Processed By"
                    value={selectedRefund?.initiated_by_id ?? '-'}
                    icon={UserRound}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {currentSection === 'credit-notes' && selectedCreditNoteId ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/20">
          <div className="h-full w-full max-w-[470px] border-l border-[#E4E4E7] bg-white">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] px-5 py-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => {
                    setSelectedCreditNoteId(null);
                    setCreditNoteActionsOpen(false);
                    setApplyCreditModalOpen(false);
                  }}
                >
                  <ArrowLeft className="size-4 text-[#3F3F46]" />
                </Button>
                <Typography className="text-[34px] font-semibold leading-none text-[#111827]">
                  #{selectedCreditNoteTitle}
                </Typography>
                <Copy className="size-4 text-[#A1A1AA]" />
              </div>
              <Popover open={creditNoteActionsOpen} onOpenChange={setCreditNoteActionsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-md border border-[#E4E4E7]"
                  >
                    <EllipsisVertical className="size-4 text-[#3F3F46]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[170px] p-1.5">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-[#111827] hover:bg-[#F4F4F5]"
                    onClick={() => {
                      setCreditNoteActionsOpen(false);
                      setApplyCreditModalOpen(true);
                    }}
                  >
                    <ChevronRight className="size-4 rotate-180 text-[#52525B]" />
                    Apply to Invoice
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-[#111827] hover:bg-[#F4F4F5]"
                    onClick={() => {
                      setCreditNoteActionsOpen(false);
                      void handleDownloadCreditNotePdf();
                    }}
                    disabled={requestPdfLoading || signedUrlLoading}
                  >
                    <Download className="size-4 text-[#52525B]" />
                    Download PDF
                  </button>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-3 px-5 py-5">
              <div className="rounded-[10px] border border-[#E4E4E7] px-3 py-2.5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography className="text-xs text-[#71717A]">Amount</Typography>
                    <Typography className="mt-1 text-[30px] font-semibold leading-none text-[#18181B]">
                      {formatCurrencyAmount(selectedCreditTotalRaw, selectedCreditNoteCurrency)}
                    </Typography>
                  </div>
                  <div className="text-right">
                    <Typography className="text-xs text-[#71717A]">Remaining</Typography>
                    <Typography className="mt-1 text-[24px] font-semibold leading-none text-[#18181B]">
                      {formatCurrencyAmount(selectedCreditRemainingRaw, selectedCreditNoteCurrency)}
                    </Typography>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[#71717A]">
                  <span>
                    Applied:{' '}
                    {formatCurrencyAmount(
                      selectedCreditAppliedRaw,
                      selectedCreditNoteCurrency
                    ).replace('£', '')}
                  </span>
                  <span>{Math.round(selectedCreditUsedPercent)}% used</span>
                </div>
                <div className="mt-2 h-5 overflow-hidden rounded-[4px] bg-[#FFF7ED]">
                  <div
                    className="h-full bg-[repeating-linear-gradient(-55deg,#FB923C,#FB923C_8px,#F97316_8px,#F97316_16px)]"
                    style={{ width: `${Math.max(selectedCreditUsedPercent, 2)}%` }}
                  />
                </div>
              </div>
              {creditNoteDetailLoading && !creditNoteDetail ? (
                <Typography className="py-6 text-sm text-[#71717A]">
                  Loading credit note details...
                </Typography>
              ) : (
                <>
                  <DrawerDetailRow
                    label="Issue Date"
                    value={formatApiDate(
                      creditNoteDetail?.issue_date ?? selectedCreditNoteListItem?.issue_date
                    )}
                    icon={CalendarDays}
                  />
                  <DrawerDetailRow
                    label="Amount"
                    value={formatCurrencyAmount(
                      creditNoteDetail?.total_credit_amount ??
                        selectedCreditNoteListItem?.total_credit_amount ??
                        '0.00',
                      selectedCreditNoteCurrency
                    )}
                    icon={ReceiptText}
                  />
                  <DrawerDetailRow
                    label="Linked Invoice (Source)"
                    value={
                      creditNoteDetail?.source_invoice_number ??
                      selectedCreditNoteListItem?.source_invoice_number ??
                      '-'
                    }
                    icon={Hash}
                  />
                  <DrawerDetailRow
                    label="Allocated To"
                    value={
                      <span className="max-w-[240px] text-right leading-snug text-[#111827]">
                        {creditNoteDetailLoading && !creditNoteDetail
                          ? '—'
                          : (() => {
                              const apps = creditNoteDetail?.applications ?? [];
                              if (apps.length > 0) {
                                return formatCreditNoteApplicationsSummary(
                                  apps,
                                  selectedCreditNoteCurrency
                                );
                              }
                              const applied =
                                Number.parseFloat(
                                  creditNoteDetail?.applied_amount ??
                                    selectedCreditNoteListItem?.applied_amount ??
                                    '0'
                                ) || 0;
                              if (applied > 0) {
                                return `${formatCurrencyAmount(
                                  String(applied),
                                  selectedCreditNoteCurrency
                                )} applied`;
                              }
                              return '-';
                            })()}
                      </span>
                    }
                    icon={ReceiptText}
                    alignStart
                  />
                  <DrawerDetailRow
                    label="Status"
                    value={
                      <Badge
                        className={cn(
                          'border-0',
                          creditNoteDetail
                            ? CREDIT_NOTE_STATUS_BADGE_CLASS[creditNoteDetail.status]
                            : CREDIT_NOTE_STATUS_BADGE_CLASS.OPEN
                        )}
                      >
                        {creditNoteDetail
                          ? CREDIT_NOTE_STATUS_LABELS[creditNoteDetail.status]
                          : '-'}
                      </Badge>
                    }
                    icon={CheckCircle2}
                  />
                  <DrawerDetailRow
                    label="Reason Category"
                    value={
                      <Badge
                        className={cn(
                          'border-0',
                          creditNoteDetail
                            ? CREDIT_NOTE_REASON_BADGE_CLASS[creditNoteDetail.reason_category]
                            : CREDIT_NOTE_REASON_BADGE_CLASS.OTHER
                        )}
                      >
                        {creditNoteDetail
                          ? CREDIT_NOTE_REASON_CATEGORY_LABELS[creditNoteDetail.reason_category]
                          : '-'}
                      </Badge>
                    }
                    icon={ReceiptText}
                  />
                  <DrawerDetailRow
                    label="Reason"
                    value={
                      <span className="max-w-[220px] text-right leading-5 text-[#111827]">
                        {creditNoteDetail?.reason ?? selectedCreditNoteListItem?.reason ?? '-'}
                      </span>
                    }
                    icon={ReceiptText}
                    alignStart
                  />
                </>
              )}
              <div className="rounded-lg bg-[#EFF6FF] px-3 py-2.5 text-sm text-[#1D4ED8]">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-4 shrink-0" />
                  <span>
                    Note: VAT is not calculated within credit notes. Adjustments are applied to
                    invoice totals inclusive of any applicable tax.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <Dialog open={applyCreditModalOpen} onOpenChange={setApplyCreditModalOpen}>
        <DialogContent className="grid h-auto max-h-[90vh] w-full max-w-[520px] gap-0 overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-white p-0 shadow-xl">
          <DialogHeader className="space-y-0 border-b border-[#E5E7EB] px-5 py-4">
            <DialogTitle className="text-center text-2xl font-semibold leading-none text-[#18181B]">
              Apply to Invoice
            </DialogTitle>
            <DialogDescription className="sr-only">
              Select an invoice with an outstanding balance to apply this credit note.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col px-5 py-4">
            <div className="space-y-2.5">
              <Typography className="text-xs font-medium text-[#18181B]">
                Select Invoice <span className="text-[#BE1E2D]">*</span>
              </Typography>
              <Input
                value={creditCandidateSearchInput}
                onChange={(e) => setCreditCandidateSearchInput(e.target.value)}
                placeholder="Search invoice number..."
                leftIcon={Search}
                className="h-10 rounded-[6px] border-[#E4E4E7] bg-[#FAFAFA] text-sm"
              />
            </div>
            <div className="mt-3 max-h-[280px] overflow-y-auto rounded-[10px] border border-[#E4E4E7] bg-white">
              {creditNoteCandidatesLoading ? (
                <div className="px-5 py-12 text-center text-sm text-[#71717A]">
                  Loading invoices...
                </div>
              ) : eligibleCreditNoteCandidates.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-[#71717A]">
                  {(creditNoteCandidatesRes?.items ?? []).length === 0
                    ? 'No eligible invoices found.'
                    : 'No invoices with an outstanding balance match your search.'}
                </div>
              ) : (
                eligibleCreditNoteCandidates.map((candidate) => {
                  const active = selectedCandidateInvoiceId === candidate.invoice_id;
                  const paymentLabel = formatCreditCandidatePaymentStatus(candidate.payment_status);
                  return (
                    <button
                      key={candidate.invoice_id}
                      type="button"
                      className={cn(
                        'flex w-full items-center justify-between gap-4 border-b border-[#ECEEF2] px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-[#F7F8FA]',
                        active && 'bg-[#F3F4F6]'
                      )}
                      onClick={() => setSelectedCandidateInvoiceId(candidate.invoice_id)}
                    >
                      <div className="min-w-0">
                        <Typography className="text-xs font-semibold text-[#18181B]">
                          {candidate.invoice_number}
                        </Typography>
                        <Typography className="mt-0.5 text-[11px] text-[#71717A]">
                          Due {formatApiDate(candidate.due_date)} — {paymentLabel}
                        </Typography>
                      </div>
                      <div className="shrink-0 text-right">
                        <Typography className="text-2xl font-semibold leading-none text-[#18181B]">
                          {formatCurrencyAmount(
                            candidate.outstanding_amount,
                            selectedCreditNoteCurrency
                          )}
                        </Typography>
                        <Typography className="mt-1 text-[11px] font-medium text-[#A1A1AA]">
                          Outstanding
                        </Typography>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-[#E5E7EB] px-5 py-4">
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-[8px] border-[#E4E4E7] bg-white text-base font-medium text-[#18181B] hover:bg-[#FAFAFA]"
              onClick={() => setApplyCreditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="h-11 flex-1 rounded-[8px] bg-[#BE1E2D] text-base font-semibold text-white hover:bg-[#9E1924]"
              disabled={!selectedCandidateInvoiceId || applyCreditLoading}
              onClick={() => {
                void handleApplyCreditToInvoice()
                  .then(() => {
                    void refetchCreditNotes();
                  })
                  .catch(() => {
                    // Keep modal open to let user retry.
                  });
              }}
            >
              Apply Credit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DrawerDetailRow({
  label,
  value,
  icon: Icon,
  alignStart = false,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  alignStart?: boolean;
}): React.JSX.Element {
  return (
    <div
      className={cn('grid grid-cols-[1fr_auto] items-center gap-3', alignStart && 'items-start')}
    >
      <div className="inline-flex items-center gap-2">
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#F4F4F5] text-[#71717A]">
          <Icon className="size-3.5" />
        </span>
        <Typography className="text-sm font-normal text-[#71717A]">{label}</Typography>
      </div>
      <Typography component="div" className="text-sm font-medium text-[#111827]">
        {value}
      </Typography>
    </div>
  );
}

function RefundFilterChipSection<T extends string>(props: {
  title: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  selected: T[];
  onToggle: (value: T) => void;
  showDivider?: boolean;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 pb-4',
        props.showDivider === false ? '' : 'border-b border-[#E4E4EA]'
      )}
    >
      <Typography variant="caption" className="text-base font-normal leading-snug text-[#252525]">
        {props.title}
      </Typography>
      <div className="flex flex-wrap gap-x-2 gap-y-2.5">
        {props.options.map((opt) => {
          const active = props.selected.includes(opt.value);
          return (
            <Button
              key={opt.value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => props.onToggle(opt.value)}
              className={cn(
                'h-8 rounded-full border-[#E5E7EB] bg-white px-3 text-xs font-normal text-[#18181B] hover:bg-white',
                active ? 'border-[#BE1E2D]' : 'border-[#E5E7EB]'
              )}
            >
              {active ? (
                <span className="mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#BE1E2D] text-white">
                  <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                </span>
              ) : (
                <span className="mr-2 inline-block h-4 w-4 shrink-0 rounded-full border border-[#D4D4D8]" />
              )}
              {opt.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
