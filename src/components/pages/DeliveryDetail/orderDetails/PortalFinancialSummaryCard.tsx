import type React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@/components/atoms/Typography';
import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';
import { FinancialSummaryIllustration } from '@/assets';
import {
  mapPaymentMethodDisplayLabel,
  mapPaymentStatusDisplayLabel,
  ORDER_DETAIL_SECTION_HEADER,
  ORDER_DETAIL_SECTION_SHELL,
} from '@/lib/orderDetailDisplay';

export interface PortalFinancialSummaryCardProps {
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  linkedInvoiceId?: string | null;
  linkedInvoiceNumber?: string | null;
  cardLastFour?: string | null;
  className?: string;
}

function paymentStatusBadgeClass(status?: string | null): string {
  const greenPill =
    'rounded-full border border-[#D1FAE5] bg-[#ECFDF5] px-4 py-1 text-[11px] font-semibold text-[#10B981] shadow-none hover:bg-[#ECFDF5]';
  const redPill =
    'rounded-full border border-[#FECACA] bg-[#FEF2F2] px-4 py-1 text-[11px] font-semibold text-[#EF4444] shadow-none hover:bg-[#FEF2F2]';
  if (!status) return greenPill;
  const u = status.toUpperCase();
  if (u.includes('UNPAID') || u.includes('FAILED') || u.includes('OVERDUE')) return redPill;
  return greenPill;
}

export default function PortalFinancialSummaryCard({
  paymentMethod,
  paymentStatus,
  linkedInvoiceId,
  linkedInvoiceNumber,
  cardLastFour,
  className,
}: PortalFinancialSummaryCardProps): React.JSX.Element {
  const invoiceLabel = linkedInvoiceNumber?.trim() || null;
  const invoiceHref = linkedInvoiceId?.trim()
    ? `/billing/invoices/${encodeURIComponent(linkedInvoiceId.trim())}`
    : null;
  const cardMask = cardLastFour?.trim() ? `**** ${cardLastFour.trim()}` : '—';
  const showCardNumber = (paymentMethod ?? '').toUpperCase().includes('CARD');

  return (
    <div className={cn(ORDER_DETAIL_SECTION_SHELL, 'h-full', className)}>
      <div className={ORDER_DETAIL_SECTION_HEADER}>
        <Typography
          variant="label"
          className="mb-0 text-[11px] font-medium uppercase tracking-[0.1em] text-[#0D0D12] md:text-[13px]"
        >
          Financial summary
        </Typography>
      </div>

      <div className="flex flex-col items-center gap-8 p-6 md:p-8">
        <div className="flex h-[145px] w-full max-w-[360px] items-center justify-center">
          <img
            src={FinancialSummaryIllustration}
            alt=""
            className="h-full w-full object-contain"
            aria-hidden
          />
        </div>

        <div className="w-full space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Typography variant="body" className="shrink-0 text-[14px] font-medium text-[#858594]">
              Linked Invoice
            </Typography>
            {invoiceLabel && invoiceHref ? (
              <Link
                to={invoiceHref}
                className="truncate text-right text-[15px] font-medium text-[#030303] underline decoration-[#030303] underline-offset-4 hover:text-[#111827]"
              >
                {invoiceLabel}
              </Link>
            ) : (
              <Typography variant="body" weight="medium" className="text-[15px] text-[#030303]">
                {invoiceLabel ?? '—'}
              </Typography>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <Typography variant="body" className="shrink-0 text-[14px] font-medium text-[#858594]">
              Payment Method
            </Typography>
            <Badge className="rounded-full border-none bg-[#7C3AED] px-4 py-1 text-[11px] font-semibold text-white shadow-none hover:bg-[#7C3AED]">
              {mapPaymentMethodDisplayLabel(paymentMethod)}
            </Badge>
          </div>

          {showCardNumber ? (
            <div className="flex items-center justify-between gap-4">
              <Typography
                variant="body"
                className="shrink-0 text-[14px] font-medium text-[#858594]"
              >
                Credit Card Number
              </Typography>
              <Typography
                variant="body"
                weight="medium"
                className="text-[15px] tracking-wider text-[#030303]"
              >
                {cardMask}
              </Typography>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4">
            <Typography variant="body" className="shrink-0 text-[14px] font-medium text-[#858594]">
              Payment Status
            </Typography>
            <Badge className={paymentStatusBadgeClass(paymentStatus)}>
              {mapPaymentStatusDisplayLabel(paymentStatus)}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
