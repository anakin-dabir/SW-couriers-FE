import type React from 'react';
import type { jsPDF } from 'jspdf';
import { useCallback, useRef } from 'react';
import { ChevronDown, Clock, DollarSign, Download, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';
import type {
  PaymentInvoiceMock,
  PaymentInvoiceServiceTier,
  PaymentInvoiceStopRow,
} from '@/lib/paymentInvoiceTypes';

export interface PickupInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: PaymentInvoiceMock;
}

const tierBadgeClass: Record<PaymentInvoiceServiceTier, string> = {
  FASTEST: 'border-[#E9D5FF] bg-[#F5F3FF] text-[#7C3AED] [&_svg]:text-[#7C3AED]',
  STANDARD: 'border-[#E5E7EB] bg-[#F3F4F6] text-[#111827] [&_svg]:text-[#111827]',
  ECONOMY: 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D] [&_svg]:text-[#15803D]',
};

function TierIcon({ tier }: { tier: PaymentInvoiceServiceTier }): React.JSX.Element {
  switch (tier) {
    case 'FASTEST':
      return <Zap className="size-3.5" aria-hidden />;
    case 'STANDARD':
      return <Clock className="size-3.5" aria-hidden />;
    case 'ECONOMY':
      return <DollarSign className="size-3.5" aria-hidden />;
    default:
      return <Clock className="size-3.5" aria-hidden />;
  }
}

export default function PickupInvoiceModal({
  open,
  onOpenChange,
  invoice,
}: PickupInvoiceModalProps): React.JSX.Element {
  const captureRef = useRef<HTMLDivElement | null>(null);

  const createPdfFromElement = useCallback(async (element: HTMLDivElement): Promise<jsPDF> => {
    const [{ default: html2canvas }, { default: JsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });
    const imageData = canvas.toDataURL('image/png');
    const JsPDFCtor = JsPDF as unknown as new (
      ...args: ConstructorParameters<typeof jsPDF>
    ) => jsPDF;
    const pdf = new JsPDFCtor('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const maxW = pageWidth - 2 * margin;
    const maxH = pageHeight - 2 * margin;
    let w = maxW;
    let h = (canvas.height * w) / canvas.width;
    if (h > maxH) {
      h = maxH;
      w = (canvas.width * h) / canvas.height;
    }
    const x = margin + (maxW - w) / 2;
    const y = margin + (maxH - h) / 2;
    pdf.addImage(imageData, 'PNG', x, y, w, h);

    return pdf;
  }, []);

  const handleDownloadInvoice = useCallback(async (): Promise<void> => {
    if (!captureRef.current) return;
    const pdf = await createPdfFromElement(captureRef.current);
    const safeId = invoice.invoiceId.replace(/#/g, '').replace(/\s+/g, '-');
    pdf.save(`payment-invoice-${safeId}.pdf`);
  }, [createPdfFromElement, invoice.invoiceId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[min(90vh,900px)] w-[min(960px,calc(90vw-1.5rem))] flex-col gap-0 overflow-hidden',
          'sm:max-w-[min(960px,calc(90vw-1.5rem))]',
          'border border-[#E5E5EC] bg-[#F8F8FA] p-0 sm:rounded-[18px] sm:shadow-xl'
        )}
        aria-describedby={undefined}
      >
        <div className="flex shrink-0 flex-col gap-4 border-b border-[#E5E5EC] bg-white px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex flex-wrap items-start justify-between gap-4 pr-8">
            <div className="min-w-0 space-y-2">
              <DialogTitle className="text-left text-xl font-semibold leading-tight tracking-tight text-[#18181B] sm:text-2xl">
                Payment Invoice
              </DialogTitle>
              <DialogDescription className="sr-only">
                Payment invoice for {invoice.invoiceId}, paid, bill to {invoice.billToName}.
              </DialogDescription>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-[#A7F3D0] bg-[rgba(16,185,129,0.12)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-success-dark">
                  Paid
                </span>
                <Typography variant="body" className="text-sm text-[#71717A]">
                  Invoice ID - {invoice.invoiceId}
                </Typography>
              </div>
            </div>
            <Button
              type="button"
              variant="default"
              className="h-10 shrink-0 bg-[#AE2224] px-4 text-sm font-medium text-white hover:bg-[#991B1B]"
              onClick={() => void handleDownloadInvoice()}
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
          <div
            ref={captureRef}
            className="mx-auto max-w-[880px] space-y-6 rounded-[18px] border border-[#E5E5EC] bg-white p-5 shadow-sm sm:p-8"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <Typography variant="body" weight="semibold" className="text-sm text-[#18181B]">
                  Bill To
                </Typography>
                <Typography variant="body" weight="semibold" className="text-base text-[#18181B]">
                  {invoice.billToName}
                </Typography>
                <Typography variant="body" className="text-sm text-[#52525B]">
                  {invoice.billToEmail}
                </Typography>
                <Typography
                  variant="body"
                  className="whitespace-pre-line text-sm leading-relaxed text-[#52525B]"
                >
                  {invoice.billToAddress}
                </Typography>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Typography
                    variant="body"
                    className="text-xs font-medium uppercase tracking-wide text-[#A1A1AA]"
                  >
                    Issued on
                  </Typography>
                  <Typography
                    variant="body"
                    weight="medium"
                    className="mt-1 text-sm text-[#18181B]"
                  >
                    {invoice.issuedOn}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="body"
                    className="text-xs font-medium uppercase tracking-wide text-[#A1A1AA]"
                  >
                    Due Date
                  </Typography>
                  <Typography
                    variant="body"
                    weight="medium"
                    className="mt-1 text-sm text-[#18181B]"
                  >
                    {invoice.dueDate}
                  </Typography>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#E5E5EC] bg-[#FAFAFA]">
              <div className="border-b border-[#E5E5EC] bg-[#F4F4F5] px-4 py-3">
                <Typography variant="body" weight="semibold" className="text-sm text-[#18181B]">
                  Payment Details
                </Typography>
              </div>
              <div className="grid gap-0 sm:grid-cols-2">
                <div className="space-y-4 border-b border-[#E5E5EC] p-4 sm:border-b-0 sm:border-r">
                  <div>
                    <Typography variant="body" className="text-xs text-[#71717A]">
                      Payment Method
                    </Typography>
                    <div className="mt-1.5">
                      <span className="inline-flex items-center rounded-md border border-[#DDD6FE] bg-[#F5F3FF] px-2 py-0.5 text-xs font-semibold text-[#6D28D9]">
                        {invoice.paymentMethodLabel}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Typography variant="body" className="text-xs text-[#71717A]">
                      Cardholder Name
                    </Typography>
                    <Typography
                      variant="body"
                      weight="medium"
                      className="mt-1 text-sm text-[#18181B]"
                    >
                      {invoice.cardholderName}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body" className="text-xs text-[#71717A]">
                      Card Number
                    </Typography>
                    <Typography
                      variant="body"
                      weight="medium"
                      className="mt-1 text-sm text-[#18181B]"
                    >
                      {invoice.cardNumber}
                    </Typography>
                  </div>
                </div>
                <div className="space-y-4 p-4">
                  <div>
                    <Typography variant="body" className="text-xs text-[#71717A]">
                      Payment Date
                    </Typography>
                    <Typography
                      variant="body"
                      weight="medium"
                      className="mt-1 text-sm text-[#18181B]"
                    >
                      {invoice.paymentDate}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body" className="text-xs text-[#71717A]">
                      Paid Amount
                    </Typography>
                    <Typography
                      variant="body"
                      weight="semibold"
                      className="mt-1 text-lg text-[#18181B]"
                    >
                      {invoice.paidAmount}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#E5E5EC]">
              <div className="border-b border-[#E5E5EC] bg-[#FAFAFA] px-4 py-3">
                <Typography variant="body" weight="semibold" className="text-sm text-[#18181B]">
                  Booking Order Details
                </Typography>
              </div>
              <div className="grid gap-3 border-b border-[#E5E5EC] bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: 'Order ID', value: invoice.bookingOrderId },
                  { label: 'Total Stops', value: invoice.totalStops },
                  { label: 'Total Packages', value: invoice.totalPackages },
                  { label: 'Total Weight', value: invoice.totalWeight },
                  { label: 'Service Type', value: invoice.serviceType },
                ].map((row) => (
                  <div key={row.label}>
                    <Typography variant="body" className="text-xs text-[#71717A]">
                      {row.label}
                    </Typography>
                    <Typography
                      variant="body"
                      weight="medium"
                      className="mt-1 text-sm text-[#18181B]"
                    >
                      {row.value}
                    </Typography>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E5EC] bg-[#FAFAFA] text-xs font-medium uppercase tracking-wide text-[#71717A]">
                      <th className="px-3 py-3 font-medium">Stop</th>
                      <th className="px-3 py-3 font-medium">Tracking ID</th>
                      <th className="px-3 py-3 font-medium">Customer</th>
                      <th className="px-3 py-3 font-medium">Postcode</th>
                      <th className="px-3 py-3 font-medium">Service Tier</th>
                      <th className="px-3 py-3 font-medium">Packages</th>
                      <th className="px-3 py-3 font-medium">Weight</th>
                      <th className="px-3 py-3 text-right font-medium">Total</th>
                      <th className="w-10 px-2 py-3" aria-hidden />
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.stops.map((row: PaymentInvoiceStopRow) => (
                      <tr
                        key={`${row.stop}-${row.trackingId}`}
                        className="border-b border-[#F4F4F5]"
                      >
                        <td className="px-3 py-3 font-medium text-[#18181B]">{row.stop}</td>
                        <td className="px-3 py-3 text-[#3B82F6]">{row.trackingId}</td>
                        <td className="px-3 py-3 text-[#18181B]">{row.customer}</td>
                        <td className="px-3 py-3 text-[#52525B]">{row.postcode}</td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold',
                              tierBadgeClass[row.tier]
                            )}
                          >
                            <TierIcon tier={row.tier} />
                            {row.tier}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[#52525B]">{row.packages}</td>
                        <td className="px-3 py-3 text-[#52525B]">{row.weight}</td>
                        <td className="px-3 py-3 text-right font-semibold text-[#18181B]">
                          {row.total}
                        </td>
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            className="inline-flex size-8 items-center justify-center rounded-full border border-[#E5E5EC] bg-white text-[#71717A] hover:bg-[#F4F4F5]"
                            aria-label="Row details"
                          >
                            <ChevronDown className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-end gap-2 border-t border-[#E5E5EC] bg-[#FAFAFA] px-4 py-4">
                <div className="flex w-full max-w-xs justify-between text-sm text-[#52525B]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#18181B]">{invoice.subtotal}</span>
                </div>
                <div className="flex w-full max-w-xs justify-between text-sm text-[#52525B]">
                  <span>VAT (6%)</span>
                  <span className="font-medium text-[#18181B]">{invoice.vat}</span>
                </div>
                <div className="mt-1 flex w-full max-w-xs justify-between border-t border-[#E5E5EC] pt-3 text-base font-semibold text-[#18181B]">
                  <span>Total</span>
                  <span>{invoice.total}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-[#E5E5EC] pt-6">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#52525B]">
                <span>
                  <span className="font-medium text-[#18181B]">Email: </span>
                  {invoice.companyEmail}
                </span>
                <span>
                  <span className="font-medium text-[#18181B]">Phone: </span>
                  {invoice.companyPhone}
                </span>
              </div>
              <Typography variant="body" className="text-sm leading-relaxed text-[#52525B]">
                {invoice.companyAddress}
              </Typography>
              <div className="rounded-lg bg-[#F8F8FA] p-4">
                <Typography variant="body" weight="semibold" className="text-sm text-[#18181B]">
                  {invoice.chargesNoteTitle}
                </Typography>
                <Typography variant="body" className="mt-2 text-sm leading-relaxed text-[#71717A]">
                  {invoice.chargesNoteBody}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
