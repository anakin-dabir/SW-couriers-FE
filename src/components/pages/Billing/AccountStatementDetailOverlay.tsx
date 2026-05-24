import * as React from 'react';
import { Clock3, Download, Loader2, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { Badge } from '@/components/atoms/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { SwCouriersLogo } from '@/assets/svg';
import { cn } from '@/lib/utils';
import type { AccountStatementDetail, AccountStatementLedgerRow } from '@/store/api';

const AGING_BUCKETS = [
  { label: '1-30 Days', key: 'days_1_30' as const },
  { label: '31-60 Days', key: 'days_31_60' as const },
  { label: '61-90 Days', key: 'days_61_90' as const },
  { label: '90+ Days', key: 'days_90_plus' as const },
] as const;

const SKELETON_TABLE_ROWS = 6;

function formatApiDate(value?: string | null): string {
  if (!value) return '-';
  try {
    const raw = value.length >= 10 ? value.slice(0, 10) : value;
    return new Date(`${raw}T00:00:00`).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

function formatStatementPeriodRange(periodStart: string, periodEnd: string): string {
  try {
    const start = parseISO(periodStart.length >= 10 ? periodStart.slice(0, 10) : periodStart);
    const end = parseISO(periodEnd.length >= 10 ? periodEnd.slice(0, 10) : periodEnd);
    return `${format(start, 'dd/MM/yyyy')} To ${format(end, 'dd/MM/yyyy')}`;
  } catch {
    return `${periodStart} To ${periodEnd}`;
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

function formatLedgerRowType(rowType: string): string {
  switch (rowType) {
    case 'PAYMENT':
      return 'Payment';
    case 'CREDIT_NOTE':
      return 'Credit Note';
    case 'REFUND':
      return 'Refund';
    case 'LATE_PENALTY':
    case 'PENALTY':
      return 'Late Penalty';
    default:
      return 'Invoice';
  }
}

function getLedgerRowTypeBadgeClass(rowType: string): string {
  switch (rowType.toUpperCase()) {
    case 'PAYMENT':
      return 'bg-[#DBEAFE] text-[#2563EB]';
    case 'CREDIT_NOTE':
      return 'bg-[#EDE9FE] text-[#7C3AED]';
    case 'REFUND':
      return 'bg-[#FEE2E2] text-[#DC2626]';
    case 'LATE_PENALTY':
    case 'PENALTY':
      return 'bg-[#FFEDD5] text-[#EA580C]';
    default:
      return 'bg-[#F3F4F6] text-[#374151]';
  }
}

function formatLedgerRowStatus(status: string): string {
  if (!status.trim()) return '-';
  return status
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getLedgerRowStatusBadgeClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes('overdue')) {
    return 'bg-[#FEE2E2] text-[#DC2626]';
  }
  if (normalized.includes('unpaid')) {
    return 'bg-[#FFEDD5] text-[#EA580C]';
  }
  if (normalized.includes('paid') || normalized.includes('deposited')) {
    return 'bg-[#DCFCE7] text-[#16A34A]';
  }
  return 'bg-[#F3F4F6] text-[#374151]';
}

function SkeletonBar({ className }: { className?: string }): React.JSX.Element {
  return <div className={cn('animate-pulse rounded-md bg-[#E4E4E7]', className)} aria-hidden />;
}

function StatementDetailSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading statement">
      <div className="flex justify-between gap-6">
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBar className="h-4 w-40" />
          <SkeletonBar className="h-3 w-56" />
          <SkeletonBar className="h-3 w-44" />
        </div>
        <div className="space-y-2 text-right">
          <SkeletonBar className="ml-auto h-5 w-48" />
          <SkeletonBar className="ml-auto h-3 w-36" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {AGING_BUCKETS.map((bucket) => (
          <div key={bucket.label} className="rounded-lg border border-[#E4E4E7] bg-white p-3">
            <SkeletonBar className="mb-3 size-9 rounded-full" />
            <SkeletonBar className="h-3 w-16" />
            <SkeletonBar className="mt-2 h-7 w-24" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
        <SkeletonBar className="h-4 w-32" />
        <SkeletonBar className="h-6 w-28" />
      </div>
      <div className="overflow-hidden rounded-lg border border-[#E4E4E7]">
        <div className="border-b border-[#E4E4E7] px-3 py-2.5">
          <SkeletonBar className="h-4 w-32" />
        </div>
        <div className="space-y-0 p-3">
          {Array.from({ length: SKELETON_TABLE_ROWS }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-8 gap-2 border-b border-[#F4F4F5] py-3 last:border-0"
            >
              <SkeletonBar className="h-3 w-full" />
              <SkeletonBar className="h-3 w-full" />
              <SkeletonBar className="h-5 w-14 rounded-full" />
              <SkeletonBar className="h-3 w-full" />
              <SkeletonBar className="h-3 w-full" />
              <SkeletonBar className="h-5 w-12 rounded-full" />
              <SkeletonBar className="ml-auto h-3 w-16" />
              <SkeletonBar className="ml-auto h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="ml-auto max-w-xs space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex justify-end gap-3">
            <SkeletonBar className="h-3 w-32" />
            <SkeletonBar className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-[#E4E4E7] pt-3">
        <SkeletonBar className="h-4 w-32" />
        <SkeletonBar className="h-6 w-28" />
      </div>
    </div>
  );
}

function AgingSummaryCards({
  aging,
  currency,
}: {
  aging: AccountStatementDetail['aging'] | undefined;
  currency: string;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {AGING_BUCKETS.map((bucket) => (
        <div
          key={bucket.label}
          className="rounded-lg border border-[#E4E4E7] bg-white px-3 py-3 shadow-none"
        >
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#FFF7ED] text-[#F59E0B]">
            <Clock3 className="size-4" aria-hidden />
          </span>
          <Typography className="mt-2 text-xs font-medium text-[#F59E0B]">
            {bucket.label}
          </Typography>
          <Typography className="mt-1 text-[28px] font-semibold leading-none text-[#18181B]">
            {formatCurrencyAmount(aging?.[bucket.key] ?? '0', currency)}
          </Typography>
        </div>
      ))}
    </div>
  );
}

function StatementLedgerTable({
  rows,
  currency,
}: {
  rows: AccountStatementLedgerRow[];
  currency: string;
}): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-[#E4E4E7]">
      <div className="border-b border-[#E4E4E7] bg-white px-3 py-2.5">
        <Typography className="text-sm font-semibold text-[#18181B]">Invoices Details</Typography>
      </div>
      <div className="overflow-x-auto bg-white">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium text-[#71717A]">Invoice ID</TableHead>
              <TableHead className="text-xs font-medium text-[#71717A]">Issue Date</TableHead>
              <TableHead className="text-xs font-medium text-[#71717A]">Type</TableHead>
              <TableHead className="text-xs font-medium text-[#71717A]">Order ID</TableHead>
              <TableHead className="text-xs font-medium text-[#71717A]">Payment Date</TableHead>
              <TableHead className="text-xs font-medium text-[#71717A]">Status</TableHead>
              <TableHead className="text-right text-xs font-medium text-[#71717A]">
                Amount
              </TableHead>
              <TableHead className="text-right text-xs font-medium text-[#71717A]">
                Balance
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-[#71717A]">
                  No activity on this statement.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  key={`${row.row_type}-${row.reference_id}`}
                  className={cn(index % 2 === 1 && 'bg-[#FAFAFC]')}
                >
                  <TableCell className="font-medium text-[#52525B] underline decoration-[#A1A1AA]">
                    {row.reference_number}
                  </TableCell>
                  <TableCell className="text-[#52525B]">{formatApiDate(row.issue_date)}</TableCell>
                  <TableCell>
                    <Badge className={cn('border-0', getLedgerRowTypeBadgeClass(row.row_type))}>
                      {formatLedgerRowType(row.row_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#52525B]">{row.order_ref ?? '-'}</TableCell>
                  <TableCell className="text-[#52525B]">
                    {row.payment_date
                      ? formatApiDate(row.payment_date)
                      : formatApiDate(row.issue_date)}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('border-0', getLedgerRowStatusBadgeClass(row.status))}>
                      {formatLedgerRowStatus(row.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-[#18181B]">
                    {formatCurrencyAmount(row.amount, currency)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-[#18181B]">
                    {formatCurrencyAmount(row.balance, currency)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatementDetailBody({ detail }: { detail: AccountStatementDetail }): React.JSX.Element {
  const currency = detail.snapshot.currency ?? 'GBP';
  const aging = detail.aging ?? detail.snapshot.aging;
  const rows = detail.snapshot.rows ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Typography className="text-sm font-semibold text-[#18181B]">
            {detail.client_name || 'Client'}
          </Typography>
          {detail.client_address ? (
            <Typography className="mt-1 whitespace-pre-line text-xs leading-relaxed text-[#71717A]">
              {detail.client_address}
            </Typography>
          ) : null}
          {detail.client_email ? (
            <Typography className="mt-1 text-xs text-[#71717A]">{detail.client_email}</Typography>
          ) : null}
        </div>
        <div className="text-left lg:text-right">
          <Typography id="statement-detail-title" className="text-lg font-semibold text-[#18181B]">
            Statement of Accounts
          </Typography>
          <Typography className="mt-1 text-sm text-[#71717A] underline decoration-[#D4D4D8] underline-offset-4">
            {formatStatementPeriodRange(detail.period_start, detail.period_end)}
          </Typography>
        </div>
      </div>

      <AgingSummaryCards aging={aging} currency={currency} />

      <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
        <Typography className="text-sm font-medium text-[#18181B]">Opening Balance</Typography>
        <Typography className="text-lg font-semibold tabular-nums text-[#18181B]">
          {formatCurrencyAmount(detail.opening_balance, currency)}
        </Typography>
      </div>

      <StatementLedgerTable rows={rows} currency={currency} />

      <div className="ml-auto max-w-sm space-y-1.5 text-right text-sm text-[#3F3F46]">
        <div className="flex justify-end gap-6">
          <span>Total Invoice Amount</span>
          <span className="min-w-[120px] font-medium tabular-nums text-[#18181B]">
            {formatCurrencyAmount(detail.total_invoice_amount, currency)}
          </span>
        </div>
        <div className="flex justify-end gap-6">
          <span>Total Paid</span>
          <span className="min-w-[120px] font-medium tabular-nums text-[#18181B]">
            {formatCurrencyAmount(detail.total_paid, currency)}
          </span>
        </div>
        <div className="flex justify-end gap-6">
          <span>Total Unpaid</span>
          <span className="min-w-[120px] font-medium tabular-nums text-[#18181B]">
            {formatCurrencyAmount(detail.total_unpaid, currency)}
          </span>
        </div>
        <div className="flex justify-end gap-6">
          <span>Total Overdue</span>
          <span className="min-w-[120px] font-medium tabular-nums text-[#18181B]">
            {formatCurrencyAmount(detail.total_overdue, currency)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#E4E4E7] pt-3">
        <Typography className="text-sm font-medium text-[#18181B]">Closing Balance</Typography>
        <Typography className="text-lg font-semibold tabular-nums text-[#18181B]">
          {formatCurrencyAmount(detail.closing_balance, currency)}
        </Typography>
      </div>
    </div>
  );
}

export function AccountStatementDetailOverlay(props: {
  open: boolean;
  statementId?: string | null;
  detail: AccountStatementDetail | null;
  isLoading: boolean;
  isRefreshing?: boolean;
  isDownloading: boolean;
  onClose: () => void;
  onDownload: () => void;
}): React.JSX.Element | null {
  if (!props.open) return null;

  const detailMatchesSelection =
    !props.statementId || !props.detail || props.detail.id === props.statementId;
  const resolvedDetail = detailMatchesSelection ? props.detail : null;
  const showSkeleton = props.isLoading && !resolvedDetail;
  const showError = !props.isLoading && !resolvedDetail;
  const showContent = Boolean(resolvedDetail);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- modal backdrop
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="statement-detail-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) props.onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') props.onClose();
      }}
    >
      <div className="relative flex max-h-[92vh] min-h-[min(820px,92vh)] w-full max-w-[1120px] flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="shrink-0 border-b border-[#F4F4F5] px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <img src={SwCouriersLogo} alt="SW Couriers" className="h-8 w-auto" />
              {resolvedDetail ? (
                <Typography className="mt-2 text-xs text-[#71717A]">
                  {resolvedDetail.statement_number}
                </Typography>
              ) : (
                <SkeletonBar className="mt-2 h-3 w-28" />
              )}
            </div>
            <div className="flex items-start gap-3">
              <div className="hidden text-right text-xs leading-relaxed text-[#71717A] sm:block">
                <div>{resolvedDetail?.provider.name ?? 'SW Couriers'}</div>
                <div className="max-w-[220px] whitespace-pre-line">
                  {resolvedDetail?.provider.address ?? ''}
                </div>
                {resolvedDetail?.provider.email ? <div>{resolvedDetail.provider.email}</div> : null}
              </div>
              <Button
                className="shrink-0 bg-[#BE1E2D] text-white hover:bg-[#A21926]"
                disabled={!resolvedDetail || props.isDownloading}
                onClick={props.onDownload}
              >
                {props.isDownloading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                ) : (
                  <Download className="mr-2 size-4" aria-hidden />
                )}
                Download Statement
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={props.onClose}
                aria-label="Close statement"
              >
                <X className="size-4 text-[#71717A]" />
              </Button>
            </div>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {props.isRefreshing ? (
            <div className="pointer-events-none absolute inset-0 z-10 bg-white/50" aria-hidden />
          ) : null}
          {props.isRefreshing ? (
            <div className="absolute right-5 top-3 z-20 flex items-center gap-2 rounded-md border border-[#E4E4E7] bg-white px-2 py-1 shadow-sm">
              <Loader2 className="size-3.5 animate-spin text-[#71717A]" aria-hidden />
              <span className="text-xs text-[#71717A]">Updating…</span>
            </div>
          ) : null}

          <div
            className={cn(
              'transition-opacity duration-200',
              props.isRefreshing && showContent && 'opacity-80'
            )}
          >
            {showSkeleton ? <StatementDetailSkeleton /> : null}
            {showContent && resolvedDetail ? <StatementDetailBody detail={resolvedDetail} /> : null}
            {showError ? (
              <Typography className="py-16 text-center text-sm text-[#71717A]">
                Could not load statement details.
              </Typography>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
