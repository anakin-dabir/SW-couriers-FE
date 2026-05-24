/* eslint-disable react/forbid-elements -- ported as-is from the admin portal so the
   layout stays in lockstep with ViewInvoiceModal; raw `<p>`/`<h2>`/`<h3>` mirror the
   admin markup. Refactor to <Typography> if/when the design is reworked. */
import React from 'react';
import type { jsPDF as JsPDFType } from 'jspdf';
import { format, parseISO } from 'date-fns';
import { ChevronDown, ChevronUp, Clock3, Download, Leaf, Zap } from 'lucide-react';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/Button';
import { Dialog, DialogContent } from '@/components/molecules/dialog';
import { SwCouriersLogo } from '@/assets/svg';
import {
  useGetInvoiceByIdQuery,
  useGetInvoicePaymentsQuery,
  useGetInvoicesQuery,
} from '@/store/api';
import type { InvoiceLineItem } from '@/store/api/invoicesApi';

interface DeliveryInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Human-readable order reference (e.g. `SWC-ORD-000123`). Used to locate the
   * invoice for this order via the `/invoices` list search. `deliveryId` is
   * accepted as an alias for backwards compatibility with older call sites.
   */
  orderReference?: string | null;
  deliveryId?: string | null;
  onDownloadInvoice?: () => void;
}

const EMPTY_LINE_ITEMS: InvoiceLineItem[] = [];

function formatGBP(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return '£0.00';
  return `£${n.toFixed(2)}`;
}

function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'd MMMM yyyy');
  } catch {
    return iso;
  }
}

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'dd MMM yyyy');
  } catch {
    return iso;
  }
}

function paymentStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Unknown';
  const map: Record<string, string> = {
    UNPAID: 'Unpaid',
    PARTIALLY_PAID: 'Partially paid',
    PAID: 'Paid',
    OVERDUE: 'Overdue',
    VOID: 'Void',
    WRITTEN_OFF: 'Written off',
  };
  return map[status.toUpperCase()] ?? status.replace(/_/g, ' ');
}

function paymentStatusBadgeClass(status: string | null | undefined): string {
  const s = (status ?? '').toUpperCase();
  if (s === 'PAID') return 'bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]';
  if (s === 'PARTIALLY_PAID') return 'bg-[#FEF9C3] text-[#A16207] hover:bg-[#FEF08A]';
  if (s === 'OVERDUE' || s === 'UNPAID') return 'bg-[#FFEAD5] text-[#EA580C] hover:bg-[#FFD8B4]';
  if (s === 'VOID' || s === 'WRITTEN_OFF') return 'bg-[#F3F4F6] text-[#475569] hover:bg-[#E5E7EB]';
  return 'bg-[#F3F4F6] text-[#111827]';
}

function tierVisual(lineType: string): {
  tierClass: string;
  tierIcon: 'fastest' | 'economy' | 'standard';
} {
  const t = (lineType || '').toLowerCase();
  if (t.includes('discount')) {
    return { tierClass: 'bg-[#DCFCE7] text-[#15803D]', tierIcon: 'economy' };
  }
  if (t.includes('surcharge')) {
    return { tierClass: 'bg-[#EEF2FF] text-[#7C3AED]', tierIcon: 'fastest' };
  }
  return { tierClass: 'bg-[#F3F4F6] text-[#111827]', tierIcon: 'standard' };
}

export default function DeliveryInvoiceModal({
  isOpen,
  onClose,
  orderReference,
  deliveryId,
  onDownloadInvoice,
}: DeliveryInvoiceModalProps): React.JSX.Element {
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});
  const invoiceContentRef = React.useRef<HTMLDivElement | null>(null);

  const trimmedRef = (orderReference ?? deliveryId ?? '').trim();
  const listSkip = !isOpen || !trimmedRef;

  const {
    data: listRes,
    isLoading: listLoading,
    isError: listError,
    isFetching: listFetching,
  } = useGetInvoicesQuery(
    { page: 1, size: 15, search: trimmedRef, show_draft: true },
    { skip: listSkip }
  );

  const invoiceId = React.useMemo(() => {
    const items = listRes?.items ?? [];
    if (!items.length) return undefined;
    const exact = items.find((i) => (i.order_reference ?? '').trim() === trimmedRef);
    return (exact ?? items[0]).id;
  }, [listRes, trimmedRef]);

  const detailSkip = !isOpen || !invoiceId;
  const {
    data: detail,
    isLoading: detailLoading,
    isError: detailError,
  } = useGetInvoiceByIdQuery({ invoiceId: invoiceId ?? '' }, { skip: detailSkip });

  const { data: paymentsRes, isLoading: paymentsLoading } = useGetInvoicePaymentsQuery(
    { invoiceId: invoiceId ?? '', page: 1, size: 50 },
    { skip: detailSkip || !invoiceId }
  );

  const payments = paymentsRes?.items ?? [];
  const lineRows = React.useMemo(() => detail?.line_items ?? EMPTY_LINE_ITEMS, [detail]);
  const totalPackages = lineRows.reduce((acc, li) => acc + (Number(li.quantity) || 0), 0);
  const serviceTypesLabel = React.useMemo(() => {
    const types = [...new Set(lineRows.map((l) => (l.line_type || 'service').replace(/_/g, ' ')))];
    if (!types.length) return '—';
    return types.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
  }, [lineRows]);

  const toggleRow = (key: string): void => {
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownloadInvoice = async (): Promise<void> => {
    if (onDownloadInvoice) {
      onDownloadInvoice();
      return;
    }
    if (!invoiceContentRef.current) return;
    const [{ default: html2canvas }, { default: JsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);
    const canvas = await html2canvas(invoiceContentRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });
    const imageData = canvas.toDataURL('image/png');
    const pdf = new (JsPDF as unknown as new (options: {
      orientation: 'portrait' | 'landscape';
      unit: string;
      format: number[];
    }) => JsPDFType)({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imageData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`invoice-${detail?.invoice_number ?? 'invoice'}.pdf`);
  };

  const loadError = listError || detailError;
  const loadPending =
    (!listSkip && (listLoading || listFetching)) || (!detailSkip && detailLoading);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-[1040px] rounded-2xl border border-[#E5E7EB] bg-[#F3F4F6] p-0">
        <div className="max-h-[86vh] overflow-y-auto p-4">
          {loadError ? (
            <div className="rounded-2xl border border-red-200 bg-white p-6 text-sm text-red-700">
              Could not load invoice. Check that an invoice exists for this order and you have
              access.
            </div>
          ) : !listSkip && !listLoading && !listFetching && !invoiceId ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-sm text-[#6B7280]">
              No invoice found for order{' '}
              <span className="font-medium text-gray-900">{trimmedRef || '—'}</span>.
            </div>
          ) : (
            <div
              ref={invoiceContentRef}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-4"
            >
              <div className="mb-4 flex items-start justify-between gap-4 border-b border-[#E5E7EB] pb-4">
                <div className="flex items-start gap-3">
                  <img
                    src={SwCouriersLogo}
                    alt="SW Couriers"
                    className="h-10 w-14 object-contain"
                  />
                  <div>
                    <h2 className="text-[32px] font-medium leading-none text-[#18181B]">
                      Payment Invoice
                    </h2>
                    <p className="mt-2 text-sm text-[#6B7280]">
                      Invoice ID — {detail?.invoice_number ?? (loadPending ? '…' : '—')}
                    </p>
                  </div>
                  <Badge
                    className={`mt-1 border-0 ${paymentStatusBadgeClass(detail?.payment_status)}`}
                  >
                    {paymentStatusLabel(detail?.payment_status)}
                  </Badge>
                </div>
                <Button
                  className="h-10 bg-[#AE2224] text-white hover:bg-[#991B1B]"
                  disabled={!detail}
                  onClick={() => void handleDownloadInvoice()}
                >
                  <Download className="h-4 w-4" />
                  Download Invoice
                </Button>
              </div>

              <div className="mb-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-[#6B7280]">Order Reference</p>
                    <p className="font-medium text-gray-900">
                      {detail?.order_reference ?? trimmedRef ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6B7280]">Issued on</p>
                    <p className="font-medium text-gray-900">
                      {formatLongDate(detail?.issue_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6B7280]">Due Date</p>
                    <p className="font-medium text-gray-900">{formatLongDate(detail?.due_date)}</p>
                  </div>
                </div>
              </div>

              <h3 className="mb-2 text-[22px] font-medium text-[#18181B]">Payment Details</h3>
              <div className="mb-4 overflow-hidden rounded-xl border border-[#D1D5DB]">
                <table className="w-full text-sm">
                  <thead className="bg-[#F3F4F6] text-[#6B7280]">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Payment Method</th>
                      <th className="px-3 py-2 text-left font-medium">Payment Date</th>
                      <th className="px-3 py-2 text-left font-medium">Paid Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsLoading ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-[#6B7280]">
                          Loading payments…
                        </td>
                      </tr>
                    ) : payments.length === 0 ? (
                      <tr>
                        <td className="px-3 py-2">—</td>
                        <td className="px-3 py-2">—</td>
                        <td className="px-3 py-2">—</td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.payment_id} className="border-t border-[#E5E7EB]">
                          <td className="px-3 py-2">{p.method ?? '—'}</td>
                          <td className="px-3 py-2">{formatShortDate(p.payment_date)}</td>
                          <td className="px-3 py-2">{formatGBP(p.allocated_amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <h3 className="mb-2 text-[22px] font-medium text-[#18181B]">Booking Order Details</h3>
              <div className="mb-4 overflow-hidden rounded-xl border border-[#D1D5DB] bg-[#F9FAFB]">
                <table className="w-full table-fixed text-sm">
                  <thead className="bg-[#F3F4F6] text-[#6B7280]">
                    <tr>
                      <th className="w-[24%] px-3 py-2 text-left font-medium">Order ID</th>
                      <th className="w-[14%] px-3 py-2 text-left font-medium">Line items</th>
                      <th className="w-[20%] px-3 py-2 text-left font-medium">Total Packages</th>
                      <th className="w-[42%] px-3 py-2 text-left font-medium">Service Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-y border-[#E5E7EB] bg-white">
                      <td className="px-3 py-2 font-medium underline">
                        {detail?.order_reference ?? trimmedRef ?? '—'}
                      </td>
                      <td className="px-3 py-2">{String(lineRows.length).padStart(2, '0')}</td>
                      <td className="px-3 py-2">{String(totalPackages).padStart(2, '0')}</td>
                      <td className="px-3 py-2">{serviceTypesLabel}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-3 overflow-hidden rounded-xl border border-[#D1D5DB] bg-white">
                <table className="w-full table-fixed text-sm">
                  <thead className="bg-[#F3F4F6] text-[#6B7280]">
                    <tr>
                      <th className="w-[7%] px-2 py-2 text-left font-medium" />
                      <th className="w-[7%] px-2 py-2 text-left font-medium">#</th>
                      <th className="w-[40%] px-2 py-2 text-left font-medium">Description</th>
                      <th className="w-[12%] px-2 py-2 text-left font-medium">Type</th>
                      <th className="w-[10%] px-2 py-2 text-left font-medium">Qty</th>
                      <th className="w-[12%] px-2 py-2 text-left font-medium">Unit</th>
                      <th className="w-[12%] px-2 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-4 text-center text-[#6B7280]">
                          {loadPending ? 'Loading line items…' : 'No line items on this invoice.'}
                        </td>
                      </tr>
                    ) : (
                      lineRows.map((row, idx) => {
                        const key = String(idx + 1);
                        const { tierClass, tierIcon } = tierVisual(row.line_type);
                        return (
                          <React.Fragment key={key}>
                            <tr className="border-t border-[#E5E7EB]">
                              <td className="px-2 py-2">
                                <button
                                  type="button"
                                  onClick={() => toggleRow(key)}
                                  className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#D1D5DB] bg-[#F9FAFB]"
                                  aria-label={`Toggle row ${key}`}
                                >
                                  {expandedRows[key] ? (
                                    <ChevronUp className="h-3.5 w-3.5 text-[#6B7280]" />
                                  ) : (
                                    <ChevronDown className="h-3.5 w-3.5 text-[#6B7280]" />
                                  )}
                                </button>
                              </td>
                              <td className="px-2 py-2">{key}</td>
                              <td className="px-2 py-2 break-words">{row.description}</td>
                              <td className="px-2 py-2">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${tierClass}`}
                                >
                                  {tierIcon === 'fastest' ? (
                                    <Zap className="h-3 w-3" />
                                  ) : tierIcon === 'economy' ? (
                                    <Leaf className="h-3 w-3" />
                                  ) : (
                                    <Clock3 className="h-3 w-3" />
                                  )}
                                  {row.line_type}
                                </span>
                              </td>
                              <td className="px-2 py-2">{row.quantity}</td>
                              <td className="px-2 py-2">{formatGBP(row.unit_price)}</td>
                              <td className="px-2 py-2 text-right font-medium">
                                {formatGBP(row.total_price)}
                              </td>
                            </tr>
                            {expandedRows[key] ? (
                              <tr className="border-t border-[#E5E7EB] bg-[#FAFAFA]">
                                <td colSpan={7} className="px-4 py-3 text-sm text-[#4B5563]">
                                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <p>
                                      <span className="font-medium text-gray-900">
                                        Description:
                                      </span>{' '}
                                      {row.description}
                                    </p>
                                    <p>
                                      <span className="font-medium text-gray-900">Line type:</span>{' '}
                                      {row.line_type}
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            ) : null}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="ml-auto mt-4 w-full max-w-[480px] space-y-[14px]">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium leading-7 text-[#464649]">Subtotal:</span>
                  <span className="w-[110px] text-right text-base font-medium leading-7 text-[#464649]">
                    {formatGBP(detail?.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium leading-7 text-[#464649]">
                    VAT ({detail ? `${detail.vat_rate}%` : '—'}):
                  </span>
                  <span className="w-[110px] text-right text-base font-medium leading-7 text-[#464649]">
                    {formatGBP(detail?.vat_amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium leading-7 text-[#030303]">
                    Total Invoice Amount:
                  </span>
                  <span className="w-[110px] text-right text-[18px] font-medium leading-7 text-[#030303]">
                    {formatGBP(detail?.total)}
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t border-[#E5E7EB] pt-4">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <img
                      src={SwCouriersLogo}
                      alt="SW Couriers"
                      className="mb-2 h-7 w-10 object-contain"
                    />
                    <p className="text-sm font-medium">SW Couriers</p>
                    <p className="text-sm text-[#2563EB]">account@swcouriers.co.uk</p>
                    <p className="text-sm text-[#6B7280]">+44 7700 900123</p>
                    <p className="text-sm text-[#6B7280]">55 Bridge End, Cardiff, CF10 2BN, UK</p>
                  </div>
                  <div className="max-w-[330px] text-sm text-[#6B7280]">
                    <p className="mb-1 font-medium text-gray-700">
                      How Shipment Charges Are Calculated
                    </p>
                    <p>Shipment cost is based on Chargeable Weight x Rate per kg.</p>
                    <p>Chargeable Weight = greater of Actual Weight and Volumetric Weight.</p>
                    <p>Volumetric Weight Formula: (Length x Width x Height) / 5000</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
