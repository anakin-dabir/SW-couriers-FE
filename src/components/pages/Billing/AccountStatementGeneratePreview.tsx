import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
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
import { cn } from '@/lib/utils';
import type { AccountStatementPreview, AccountStatementSummary } from '@/store/api';

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
    default:
      return 'Invoice';
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
  if (normalized.includes('overdue') || normalized.includes('unpaid')) {
    return 'bg-[#FEE2E2] text-[#DC2626]';
  }
  if (normalized.includes('paid') || normalized.includes('deposited')) {
    return 'bg-[#DCFCE7] text-[#16A34A]';
  }
  return 'bg-[#F3F4F6] text-[#374151]';
}

export function AccountStatementGeneratePreview(props: {
  fromDate?: Date;
  toDate?: Date;
  hasPeriod: boolean;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  preview: AccountStatementPreview | null;
  summary: AccountStatementSummary | null;
}): React.JSX.Element {
  const currency = props.summary?.currency ?? props.preview?.ledger.currency ?? 'GBP';
  const rows = props.preview?.ledger.rows ?? [];

  return (
    <div className="relative rounded-md border border-[#E4E4E7] bg-[#FAFAFC] p-3">
      {props.isRefreshing ? (
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-md bg-white/40"
          aria-hidden
        />
      ) : null}
      {props.isRefreshing ? (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-md border border-[#E4E4E7] bg-white px-2 py-1 shadow-sm">
          <Loader2 className="size-3.5 animate-spin text-[#71717A]" aria-hidden />
          <span className="text-xs text-[#71717A]">Updating preview…</span>
        </div>
      ) : null}
      <div className={cn('transition-opacity duration-200', props.isRefreshing && 'opacity-80')}>
        <div className="flex justify-between gap-4">
          <div className="min-w-0">
            <Typography className="text-sm font-semibold text-[#18181B]">
              {props.preview?.client_name ?? 'Client'}
            </Typography>
            <Typography className="mt-1 whitespace-pre-line text-xs text-[#71717A]">
              {props.preview?.client_address ?? ''}
            </Typography>
            {props.preview?.client_email ? (
              <Typography className="mt-1 text-xs text-[#71717A]">
                {props.preview.client_email}
              </Typography>
            ) : null}
          </div>
          <div className="text-right">
            <Typography className="text-[34px] font-bold leading-none text-[#BE1E2D]">
              SW
            </Typography>
            <div className="mt-1 text-xs text-[#71717A]">
              <div>{props.preview?.provider.name ?? 'SW Couriers'}</div>
              <div className="max-w-[220px] whitespace-pre-line">
                {props.preview?.provider.address ?? ''}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 text-right">
          <Typography className="text-sm font-semibold text-[#18181B]">
            Statement of Accounts
          </Typography>
          <Typography className="text-xs text-[#71717A]">
            {props.fromDate && props.toDate
              ? `${format(props.fromDate, 'dd/MM/yyyy')} To ${format(props.toDate, 'dd/MM/yyyy')}`
              : 'No dates selected'}
          </Typography>
        </div>
        {!props.hasPeriod ? (
          <div className="mt-4 rounded-md border border-[#E4E4E7] bg-white p-8 text-center text-[#A1A1AA]">
            <Typography className="text-sm font-medium text-[#52525B]">
              No dates selected
            </Typography>
            <Typography className="text-xs">
              Select a date range to view invoice details.
            </Typography>
          </div>
        ) : props.isInitialLoading ? (
          <div className="mt-4 flex min-h-[220px] items-center justify-center rounded-md border border-[#E4E4E7] bg-white">
            <Loader2 className="size-6 animate-spin text-[#A1A1AA]" aria-hidden />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border border-[#E4E4E7] bg-white">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-[#71717A]">
                      No ledger activity for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={`${row.row_type}-${row.reference_id}`}>
                      <TableCell className="font-medium text-[#52525B] underline">
                        {row.reference_number}
                      </TableCell>
                      <TableCell>{formatApiDate(row.issue_date)}</TableCell>
                      <TableCell>{formatLedgerRowType(row.row_type)}</TableCell>
                      <TableCell>{row.order_ref ?? '-'}</TableCell>
                      <TableCell>
                        {row.payment_date
                          ? formatApiDate(row.payment_date)
                          : formatApiDate(row.issue_date)}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('border-0', getLedgerRowStatusBadgeClass(row.status))}>
                          {formatLedgerRowStatus(row.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrencyAmount(row.amount, currency)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrencyAmount(row.balance, currency)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="mt-3 space-y-1 text-right text-xs text-[#71717A]">
          <div>
            Total Invoice Amount{' '}
            {props.summary
              ? formatCurrencyAmount(props.summary.total_invoice_amount, currency)
              : '-'}
          </div>
          <div>
            Total Paid{' '}
            {props.summary ? formatCurrencyAmount(props.summary.total_paid, currency) : '-'}
          </div>
          <div>
            Total Unpaid{' '}
            {props.summary ? formatCurrencyAmount(props.summary.total_unpaid, currency) : '-'}
          </div>
          <div>
            Total Overdue{' '}
            {props.summary ? formatCurrencyAmount(props.summary.total_overdue, currency) : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}
