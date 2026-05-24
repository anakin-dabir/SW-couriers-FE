import React, { useState, useMemo } from 'react';
import { Typography } from '@/components/atoms';
import {
  DataTable,
  DeliveryDetailsTable,
  InvoiceAlertBox,
  InvoiceMetaRow,
  MetaInfoGrid,
  SummarySection,
} from '@/components/molecules';
import {
  getInvoicePaymentTableColumns,
  type InvoicePaymentTableRow,
} from '@/lib/tableContentTransformer';
import { formatCurrency } from '@/lib/utils';
import type { InvoiceDetail, InvoiceServiceItem } from '@/types/invoice';

interface InvoiceDetailsBodyProps {
  invoice: InvoiceDetail;
  onRetryPayment?: () => void;
  onChangePaymentMethod?: () => void;
}

/**
 * InvoiceDetailsBody Molecule
 *
 * Body content section for Invoice Details Modal
 * Contains invoice meta, payment details, alert box, and summary
 */
export default function InvoiceDetailsBody({
  invoice,
  onRetryPayment,
  onChangePaymentMethod,
}: InvoiceDetailsBodyProps): React.JSX.Element {
  const PAYMENT_DETAILS = [
    {
      label: 'Payment Method',
      value: invoice.paymentDetails.paymentMethod,
    },
    {
      label: "Cardholder's Name",
      value: invoice.paymentDetails.cardholderName,
    },
    {
      label: 'Card',
      value: invoice.paymentDetails.cardType,
    },
    {
      label: 'Account number',
      value: invoice.paymentDetails.accountNumber,
    },
  ];

  const SUMMARY_ITEMS = [
    { label: 'VAT', value: invoice.vat },
    { label: 'Total', value: invoice.total, isTotal: true },
  ];

  const orderId = invoice.orderId ?? invoice.invoiceNumber;
  const paidOn = invoice.paidOn ?? invoice.paymentDetails.timestamp?.split(' ')[0] ?? '—';

  const paymentTableRow: InvoicePaymentTableRow = {
    paymentMethod: invoice.paymentDetails.cardType.toUpperCase(),
    cardholderName: invoice.paymentDetails.cardholderName,
    accountNumber: invoice.paymentDetails.accountNumber,
    noOfPackages: invoice.paymentDetails.noOfPackages ?? '—',
  };

  const servicesData = useMemo(() => invoice.services ?? [], [invoice.services]);
  const [expandedDeliveryId, setExpandedDeliveryId] = useState<string | null>(
    servicesData[0]?.deliveryId ?? null
  );

  interface DeliveryGroup {
    deliveryId: string;
    customerName: string;
    postcode: string;
    totalPackages: string;
    totalWeight: string;
    totalAmount: string;
    packages: InvoiceServiceItem[];
  }

  const deliveryGroups = useMemo<DeliveryGroup[]>(() => {
    const byDelivery = new Map<string, InvoiceServiceItem[]>();
    for (const s of servicesData) {
      const list = byDelivery.get(s.deliveryId) ?? [];
      list.push(s);
      byDelivery.set(s.deliveryId, list);
    }
    return Array.from(byDelivery.entries()).map(([deliveryId, packages]) => {
      const totalWeightNum = packages.reduce((sum, p) => sum + (parseFloat(p.weight) || 0), 0);
      const totalAmountNum = packages.reduce(
        (sum, p) => sum + (parseFloat(String(p.value).replace(/[£,\s]/g, '')) || 0),
        0
      );
      return {
        deliveryId,
        customerName: invoice.customerName ?? '—',
        postcode: invoice.postcode ?? '—',
        totalPackages: String(packages.length).padStart(2, '0'),
        totalWeight: `${totalWeightNum} kg`,
        totalAmount: formatCurrency(totalAmountNum),
        packages,
      };
    });
  }, [servicesData, invoice.customerName, invoice.postcode]);

  return (
    <div className="space-y-6">
      {/* Bill To Section */}
      <div className="bg-gray-200 rounded-xl p-5">
        <Typography variant="h5" weight="semibold" className="text-lg text-gray-900 mb-4">
          Bill To
        </Typography>
        <div className="grid grid-cols-3 gap-x-8 gap-y-1">
          <div>
            <Typography variant="caption" className="text-gray-500 text-sm">
              Company name
            </Typography>
            <Typography variant="body" weight="semibold" className="text-gray-900 mt-0.5">
              Opus Retail Ltd
            </Typography>
          </div>
          <div>
            <Typography variant="caption" className="text-gray-500 text-sm">
              Email
            </Typography>
            <Typography variant="body" className="text-gray-900 mt-0.5">
              accounts@shiftopus.co.uk
            </Typography>
          </div>
          <div>
            <Typography variant="caption" className="text-gray-500 text-sm">
              Address
            </Typography>
            <Typography variant="body" className="text-gray-900 mt-0.5">
              55 Bridge End, Cardiff, CF10 2BN, United Kingdom
            </Typography>
          </div>
        </div>
      </div>

      {/* Order section: Order ID, Issued on, Paid on */}
      <div className="bg-gray-200  rounded-xl p-5">
        <div className="grid grid-cols-3 gap-x-8 gap-y-4">
          <InvoiceMetaRow label="Order ID" value={orderId} variant="small" />
          <InvoiceMetaRow label="Issued on" value={invoice.issueDate} variant="small" />
          <InvoiceMetaRow label="Paid on" value={paidOn} variant="small" />
        </div>
      </div>

      {/* Payment Details Section */}
      <div>
        <Typography variant="h5" weight="semibold" className="text-lg text-gray-900 mb-4">
          Payment Details
        </Typography>
        {invoice.status === 'paid' ? (
          <DataTable
            columns={getInvoicePaymentTableColumns()}
            data={[paymentTableRow]}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
            showPagination={false}
            getRowKey={() => 'payment'}
            className="bg-gray-200"
          />
        ) : (
          <MetaInfoGrid
            items={PAYMENT_DETAILS}
            layout="equal"
            footerText={invoice.paymentDetails.timestamp}
            footerAlign="right"
          />
        )}
      </div>

      {/* Delivery Details — common expandable table per Figma */}
      {deliveryGroups.length > 0 && (
        <DeliveryDetailsTable
          title="Delivery Details"
          deliveryGroups={deliveryGroups}
          formatAmount={formatCurrency}
          expandedDeliveryId={expandedDeliveryId}
          onExpandToggle={(id) => setExpandedDeliveryId((prev) => (prev === id ? null : id))}
        />
      )}

      {/* Alert Box (for unpaid/overdue) */}
      <InvoiceAlertBox
        status={invoice.status}
        onRetryPayment={onRetryPayment}
        onChangePaymentMethod={onChangePaymentMethod}
      />

      {/* Invoice Summary */}
      <SummarySection items={SUMMARY_ITEMS} />
    </div>
  );
}
