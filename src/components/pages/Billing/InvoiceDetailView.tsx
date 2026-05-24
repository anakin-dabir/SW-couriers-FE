import * as React from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useNavigate } from 'react-router-dom';
import { Banknote, CheckCircle2, Clock3, Copy, Download, Loader2, ReceiptText } from 'lucide-react';
import { toast } from 'sonner';
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
import { NoCreditAccountIllustration } from '@/assets/svg';
import { useInvoicePdfDownload } from '@/hooks/useInvoicePdfDownload';
import { useOrganizationId } from '@/lib/organizationContext';
import {
  formatApiDate,
  formatCurrencyAmount,
  formatPaymentMethodLabel,
  getBadgeClass,
  INVOICE_PAYMENT_STATUS_LABELS,
} from '@/lib/billingDisplay';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { useGetInvoiceByIdQuery, useGetInvoicePaymentsQuery } from '@/store/api';
import { useGetOrganizationProfileQuery } from '@/store/api/organizationProfileApi';
import { getErrorMessage } from '@/store/api/utils';
import type { InvoiceEvent, InvoiceLineItem } from '@/store/api/invoicesApi';
import type { OrganizationProfileOrganizationDto } from '@/store/api/organizationProfileApi';

const CURRENCY = 'GBP';

function formatEventTimestamp(value: string): string {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

function formatEventLabel(event: InvoiceEvent): string {
  if (event.display_title?.trim()) return event.display_title.trim();
  return event.event_type
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildBillToLines(org: OrganizationProfileOrganizationDto | null): string[] {
  if (!org) return [];
  const name = org.trading_name?.trim() || org.legal_entity_name?.trim();
  const lines: string[] = [];
  if (name) lines.push(name);
  if (org.reg_address_line_1) lines.push(org.reg_address_line_1);
  if (org.reg_address_line_2) lines.push(org.reg_address_line_2);
  const cityLine = [org.reg_city, org.reg_postcode].filter(Boolean).join(', ');
  if (cityLine) lines.push(cityLine);
  if (org.reg_country) lines.push(org.reg_country);
  return lines;
}

function LineItemsTable({ items }: { items: InvoiceLineItem[] }): React.JSX.Element {
  if (items.length === 0) {
    return (
      <Typography className="py-4 text-center text-sm text-[#71717A]">
        No line items on this invoice.
      </Typography>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Unit</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((row, index) => (
          <TableRow key={`${row.description}-${index}`}>
            <TableCell className="text-sm text-[#18181B]">{row.description}</TableCell>
            <TableCell className="text-right text-sm">{row.quantity}</TableCell>
            <TableCell className="text-right text-sm">
              {formatCurrencyAmount(row.unit_price, CURRENCY)}
            </TableCell>
            <TableCell className="text-right text-sm font-medium">
              {formatCurrencyAmount(row.total_price, CURRENCY)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface InvoiceDetailViewProps {
  invoiceId: string;
}

export default function InvoiceDetailView({
  invoiceId,
}: InvoiceDetailViewProps): React.JSX.Element {
  const navigate = useNavigate();
  const organizationId = useOrganizationId();
  const userEmail = useAppSelector((state) => state.auth.user?.email ?? null);

  const {
    data: invoice,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetInvoiceByIdQuery({ invoiceId });
  const { data: paymentsRes, isFetching: paymentsLoading } = useGetInvoicePaymentsQuery({
    invoiceId,
    page: 1,
    size: 50,
  });
  const { data: orgProfileRes } = useGetOrganizationProfileQuery(
    organizationId ? { organizationId } : skipToken
  );

  const { download, isDownloading, pdfJobStatus } = useInvoicePdfDownload(invoiceId);

  const copyToClipboard = React.useCallback(async (value: string, label: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied.`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}.`);
    }
  }, []);

  const org = orgProfileRes?.data?.organization ?? null;
  const billToLines = buildBillToLines(org);

  const billingContact = userEmail?.trim() || '—';
  const paymentStatusLabel = invoice
    ? (INVOICE_PAYMENT_STATUS_LABELS[invoice.payment_status] ?? invoice.payment_status)
    : '';
  const paidAmount = invoice?.paid_amount ?? invoice?.amount_paid ?? '0';
  const outstanding = invoice?.outstanding_balance ?? '0';
  const paymentMethodLabel = formatPaymentMethodLabel(
    invoice?.payment_method ?? paymentsRes?.items?.[0]?.method
  );
  const firstPayment = paymentsRes?.items?.[0];

  const kpiCards = invoice
    ? [
        {
          label: 'Total Invoice Amount',
          value: formatCurrencyAmount(invoice.total, CURRENCY),
          icon: ReceiptText,
          iconWrap: 'bg-[#DBEAFE] text-[#2563EB]',
        },
        {
          label: 'Amount Paid',
          value: formatCurrencyAmount(paidAmount, CURRENCY),
          icon: CheckCircle2,
          iconWrap: 'bg-[#DCFCE7] text-[#16A34A]',
        },
        {
          label: 'Outstanding Balance',
          value: formatCurrencyAmount(outstanding, CURRENCY),
          icon: Clock3,
          iconWrap: 'bg-[#FFEDD5] text-[#EA580C]',
        },
        {
          label: 'Payment Method',
          value: paymentMethodLabel,
          icon: Banknote,
          iconWrap: 'bg-[#CCFBF1] text-[#0F766E]',
          isMethod: true,
        },
      ]
    : [];

  if (isLoading && !invoice) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#71717A]" aria-label="Loading invoice" />
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-8">
        <Typography className="text-center text-red-700">
          {getErrorMessage(error) || 'Unable to load invoice details.'}
        </Typography>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void navigate('/billing/invoices')}
          >
            Back to invoices
          </Button>
        </div>
      </div>
    );
  }

  const vatPercent = Number.parseFloat(invoice.vat_rate);
  const vatLabel = Number.isFinite(vatPercent)
    ? `VAT (${vatPercent <= 1 ? vatPercent * 100 : vatPercent}%)`
    : 'VAT';

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Typography className="text-[32px] font-semibold leading-tight text-[#111827]">
              Invoice ID - #{invoice.invoice_number}
            </Typography>
            <button
              type="button"
              className="inline-flex items-center rounded-sm text-[#A1A1AA] hover:text-[#71717A]"
              onClick={() => void copyToClipboard(invoice.invoice_number, 'Invoice number')}
              aria-label="Copy invoice number"
            >
              <Copy className="size-4" />
            </button>
            <Badge className={cn('border-0', getBadgeClass(invoice.payment_status))}>
              {paymentStatusLabel}
            </Badge>
          </div>
        </div>
        <Button
          type="button"
          className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
          disabled={isDownloading}
          onClick={() => void download(pdfJobStatus)}
        >
          {isDownloading ? (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          ) : (
            <Download className="mr-2 size-4" aria-hidden />
          )}
          Download Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
        <div className="min-w-0 space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="rounded-lg border border-[#E4E4E7] bg-white px-4 py-4 shadow-sm"
                >
                  <span
                    className={cn(
                      'inline-flex size-9 items-center justify-center rounded-full',
                      card.iconWrap
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <Typography className="mt-3 text-sm font-medium text-[#71717A]">
                    {card.label}
                  </Typography>
                  {'isMethod' in card && card.isMethod ? (
                    <Badge className="mt-2 border-0 bg-[#14B8A6] text-white">{card.value}</Badge>
                  ) : (
                    <Typography className="mt-1 text-2xl font-semibold text-[#111827]">
                      {card.value}
                    </Typography>
                  )}
                </div>
              );
            })}
          </div>

          <section className="rounded-lg border border-[#E4E4E7] bg-white">
            <div className="border-b border-[#E4E4E7] px-4 py-3">
              <Typography className="text-sm font-semibold text-[#18181B]">
                Invoice Details
              </Typography>
            </div>
            <div className="grid gap-4 px-4 py-4 sm:grid-cols-3">
              <div>
                <Typography className="text-xs text-[#71717A]">Issued Date</Typography>
                <Typography className="text-sm font-medium text-[#18181B]">
                  {formatApiDate(invoice.issue_date)}
                </Typography>
              </div>
              <div>
                <Typography className="text-xs text-[#71717A]">Due Date</Typography>
                <Typography className="text-sm font-medium text-[#18181B]">
                  {formatApiDate(invoice.due_date)}
                </Typography>
              </div>
              <div>
                <Typography className="text-xs text-[#71717A]">Billing Contact</Typography>
                <Typography className="text-sm font-medium text-[#18181B]">
                  {billingContact}
                </Typography>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#E4E4E7] bg-white">
            <div className="border-b border-[#E4E4E7] px-4 py-3">
              <Typography className="text-sm font-semibold text-[#18181B]">
                Invoice Activity
              </Typography>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Events</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="py-8 text-center text-sm text-[#71717A]">
                        No activity recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoice.events.map((event, index) => (
                      <TableRow key={`${event.created_at}-${index}`}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatEventTimestamp(event.created_at)}
                        </TableCell>
                        <TableCell className="text-sm">{formatEventLabel(event)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="rounded-lg border border-[#E4E4E7] bg-white">
            <div className="border-b border-[#E4E4E7] px-4 py-3">
              <Typography className="text-sm font-semibold text-[#18181B]">
                Payment History
              </Typography>
            </div>
            <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Bank Reference</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-sm text-[#71717A]">
                        Loading payment history…
                      </TableCell>
                    </TableRow>
                  ) : (paymentsRes?.items ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-sm text-[#71717A]">
                        No payments recorded for this invoice.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (paymentsRes?.items ?? []).map((row) => (
                      <TableRow key={row.payment_id}>
                        <TableCell className="text-sm">{formatApiDate(row.payment_date)}</TableCell>
                        <TableCell className="text-sm">
                          <span className="inline-flex items-center gap-1">
                            {row.payment_number ?? row.payment_id}
                            <button
                              type="button"
                              className="text-[#A1A1AA] hover:text-[#71717A]"
                              onClick={() =>
                                void copyToClipboard(
                                  row.payment_number ?? row.payment_id,
                                  'Payment ID'
                                )
                              }
                              aria-label="Copy payment ID"
                            >
                              <Copy className="size-3.5" />
                            </button>
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{row.transaction_id ?? '—'}</TableCell>
                        <TableCell>
                          <Badge className="border-0 bg-[#14B8A6] text-white">
                            {formatPaymentMethodLabel(row.method)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="rounded-lg border border-[#E4E4E7] bg-white">
            <div className="border-b border-[#E4E4E7] px-4 py-3">
              <Typography className="text-sm font-semibold text-[#18181B]">
                Applied Credit Notes
              </Typography>
            </div>
            {invoice.applied_credit_notes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-12">
                <img
                  src={NoCreditAccountIllustration}
                  alt=""
                  className="h-24 w-auto opacity-80"
                  aria-hidden
                />
                <Typography className="text-center text-sm text-[#71717A]">
                  No credit notes applied to this invoice.
                </Typography>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Credit Note</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.applied_credit_notes.map((note) => (
                      <TableRow key={note.credit_note_id}>
                        <TableCell>{note.credit_note_number}</TableCell>
                        <TableCell>{formatCurrencyAmount(note.applied_amount, CURRENCY)}</TableCell>
                        <TableCell>{formatApiDate(note.applied_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </div>

        <div className="min-w-0">
          <div className="sticky top-4 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] p-4 shadow-sm">
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-5">
              <div className="flex items-start justify-between gap-3 border-b border-[#E4E4E7] pb-4">
                <div>
                  <Typography className="text-lg font-semibold text-[#111827]">
                    Payment Invoice
                  </Typography>
                  <Typography className="text-xs text-[#71717A]">
                    Invoice ID - #{invoice.invoice_number}
                  </Typography>
                </div>
                <Badge className={cn('border-0 shrink-0', getBadgeClass(invoice.payment_status))}>
                  {paymentStatusLabel}
                </Badge>
              </div>

              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                <div>
                  <Typography className="text-xs font-semibold uppercase tracking-wide text-[#71717A]">
                    Bill To
                  </Typography>
                  {billToLines.length > 0 ? (
                    <div className="mt-2 space-y-0.5 text-sm text-[#18181B]">
                      {billToLines.map((line) => (
                        <Typography key={line} className="text-sm text-[#18181B]">
                          {line}
                        </Typography>
                      ))}
                    </div>
                  ) : (
                    <Typography className="mt-2 text-sm text-[#71717A]">—</Typography>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-[#71717A]">Invoice Date</span>
                    <span className="font-medium text-[#18181B]">
                      {formatApiDate(invoice.issue_date)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#71717A]">Due Date</span>
                    <span className="font-medium text-[#18181B]">
                      {formatApiDate(invoice.due_date)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto rounded-md border border-[#E4E4E7]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F9FAFB]">
                      <TableHead>Method</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Paid Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{paymentMethodLabel}</TableCell>
                      <TableCell>
                        {firstPayment ? formatApiDate(firstPayment.payment_date) : '—'}
                      </TableCell>
                      <TableCell>{formatCurrencyAmount(paidAmount, CURRENCY)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {invoice.order_reference ? (
                <div className="mt-6 rounded-md border border-[#E4E4E7] bg-[#F9FAFB] px-3 py-2">
                  <Typography className="text-xs text-[#71717A]">Order reference</Typography>
                  <Typography className="text-sm font-medium text-[#2563EB]">
                    {invoice.order_reference}
                  </Typography>
                </div>
              ) : null}

              <div className="mt-6">
                <Typography className="mb-2 text-sm font-semibold text-[#18181B]">
                  Line items
                </Typography>
                <LineItemsTable items={invoice.line_items} />
              </div>

              <div className="mt-6 ml-auto max-w-xs space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#71717A]">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrencyAmount(invoice.subtotal, CURRENCY)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#71717A]">{vatLabel}</span>
                  <span className="font-medium">
                    {formatCurrencyAmount(invoice.vat_amount, CURRENCY)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 border-t border-[#E4E4E7] pt-2">
                  <span className="font-semibold text-[#18181B]">Total Invoice Amount</span>
                  <span className="font-semibold text-[#18181B]">
                    {formatCurrencyAmount(invoice.total, CURRENCY)}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-[#E4E4E7] pt-4">
                <img src={SwCouriersLogo} alt="SW Couriers" className="h-8 w-auto" />
                <Typography className="text-right text-[10px] leading-relaxed text-[#71717A]">
                  SW Couriers Ltd · support@swcouriers.co.uk
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
