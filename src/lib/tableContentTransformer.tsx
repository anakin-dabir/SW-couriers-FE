import { Typography } from '@/components/atoms';
import { InvoiceStatusBadge } from '@/components/molecules';
import type { BillingInvoice } from '@/types/billing';
import type { InvoiceDetail, InvoiceServiceItem, DeliveryInvoiceService } from '@/types/invoice';
import type { Column } from '@/types/datatable';

/**
 * Get statement invoice columns for Statement Modal
 *
 * @returns Column definitions for invoice table in statement modal
 */
export function getStatementInvoiceColumns(): Column<BillingInvoice>[] {
  return [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      mobileOrder: 1,
      cell: (row) => (
        <Typography variant="body" className="text-sm text-gray-900">
          {row.invoiceNumber}
        </Typography>
      ),
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      mobileOrder: 2,
      cell: (row) => (
        <Typography variant="body" className="text-sm text-gray-900">
          {row.issueDate}
        </Typography>
      ),
    },
    {
      key: 'deliveryRef',
      header: 'Delivery Ref',
      mobileOrder: 3,
      cell: (row) => (
        <Typography variant="body" className="text-sm text-gray-900">
          {row.deliveryRef}
        </Typography>
      ),
    },
    {
      key: 'paymentDate',
      header: 'Payment Date',
      mobileOrder: 4,
      cell: (row) => (
        <Typography variant="body" className="text-sm text-gray-900">
          {row.paymentDate}
        </Typography>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      mobileOrder: 5,
      cellAlign: 'left',
      cell: (row) => <InvoiceStatusBadge status={row.status} />,
    },
    {
      key: 'value',
      header: 'Amount',
      mobileOrder: 6,
      cell: (row) => (
        <Typography variant="body" weight="semibold" className="text-sm text-gray-900">
          {row.value}
        </Typography>
      ),
    },
  ];
}

/**
 * Overview row interface for statement overview table
 */
export interface OverviewRow {
  totalPaid: string;
  totalUnpaid: string;
  totalOverdue: string;
  overdueInvoices: string;
  totalInvoiceAmount: string;
}

/**
 * Get statement overview columns for Statement Modal
 *
 * @returns Column definitions for overview metrics table in statement modal
 */
export function getStatementOverviewColumns(): Column<OverviewRow>[] {
  return [
    {
      key: 'totalPaid',
      header: 'Total Paid',
      mobileOrder: 1,
      cell: (row) => (
        <Typography variant="body" className="text-base text-gray-900">
          {row.totalPaid}
        </Typography>
      ),
    },
    {
      key: 'totalUnpaid',
      header: 'Total Unpaid',
      mobileOrder: 2,
      cell: (row) => (
        <Typography variant="body" className="text-base text-gray-900">
          {row.totalUnpaid}
        </Typography>
      ),
    },
    {
      key: 'totalOverdue',
      header: 'Total Overdue',
      mobileOrder: 3,
      cell: (row) => (
        <Typography variant="body" className="text-base text-gray-900">
          {row.totalOverdue}
        </Typography>
      ),
    },
    {
      key: 'overdueInvoices',
      header: 'Overdue Invoices',
      mobileOrder: 4,
      cell: (row) => (
        <Typography variant="body" className="text-base text-red-600">
          {row.overdueInvoices}
        </Typography>
      ),
    },
    {
      key: 'totalInvoiceAmount',
      header: 'Total Invoice Amount',
      mobileOrder: 5,
      cell: (row) => (
        <Typography variant="body" className="text-base text-gray-900">
          {row.totalInvoiceAmount}
        </Typography>
      ),
    },
  ];
}

/**
 * Get delivery invoice services columns for Delivery Invoice Modal
 *
 * @returns Column definitions for services table in delivery invoice modal
 */
export function getDeliveryInvoiceServicesColumns(): Column<DeliveryInvoiceService>[] {
  return [
    {
      key: 'items',
      header: 'Items',
      mobileOrder: 1,
      cell: (row) => (
        <Typography variant="body" className="text-sm text-gray-900">
          {row.items}
        </Typography>
      ),
    },
    {
      key: 'weight',
      header: 'Weight',
      mobileOrder: 2,
      cell: (row) => (
        <Typography variant="body" className="text-sm text-gray-900">
          {row.weight}
        </Typography>
      ),
    },
    {
      key: 'height',
      header: 'Height',
      mobileOrder: 3,
      cell: (row) => (
        <Typography variant="body" className="text-sm text-gray-900">
          {row.height}
        </Typography>
      ),
    },
    {
      key: 'width',
      header: 'Width',
      mobileOrder: 4,
      cell: (row) => (
        <Typography variant="body" className="text-sm text-gray-900">
          {row.width}
        </Typography>
      ),
    },
    {
      key: 'length',
      header: 'Length',
      mobileOrder: 5,
      cell: (row) => (
        <Typography variant="body" className="text-sm text-gray-900">
          {row.length}
        </Typography>
      ),
    },
    {
      key: 'value',
      header: 'Value',
      mobileOrder: 6,
      cell: (row) => (
        <Typography variant="body" className="text-sm text-gray-900">
          {row.value}
        </Typography>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      mobileOrder: 7,
      cell: (row) => (
        <Typography variant="body" className="text-sm text-gray-900">
          {row.total}
        </Typography>
      ),
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      mobileOrder: 8,
      cell: (row) => (
        <Typography variant="body" className="text-sm text-gray-900">
          {row.subtotal}
        </Typography>
      ),
    },
  ];
}

/**
 * Get delivery details columns for Invoice Details Modal
 *
 * @returns Column definitions for delivery details table in invoice details modal
 */
export function getInvoiceDeliveryColumns(): Column<InvoiceDetail['deliveryDetails'][0]>[] {
  return [
    {
      key: 'deliveryId',
      header: 'Delivery ID',
      mobileOrder: 1,
      cell: (row) => (
        <Typography variant="body" className="text-base text-gray-900">
          {row.deliveryId}
        </Typography>
      ),
    },
    {
      key: 'trackingId',
      header: 'Tracking ID',
      mobileOrder: 2,
      cell: (row) => (
        <Typography variant="body" className="text-base text-gray-900">
          {row.trackingId}
        </Typography>
      ),
    },
    {
      key: 'weight',
      header: 'Weight',
      mobileOrder: 3,
      cell: (row) => (
        <Typography variant="body" className="text-base text-gray-900">
          {row.weight}
        </Typography>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      mobileOrder: 4,
      cell: (row) => (
        <Typography variant="body" className="text-base text-gray-900">
          {row.items}
        </Typography>
      ),
    },
    {
      key: 'value',
      header: 'Value',
      mobileOrder: 5,
      cell: (row) => (
        <Typography variant="body" className="text-base text-gray-900">
          {row.value}
        </Typography>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      mobileOrder: 6,
      cell: () => (
        <Typography variant="body" className="text-sm text-blue-600 cursor-pointer hover:underline">
          View
        </Typography>
      ),
    },
  ];
}

/**
 * Row shape for paid-invoice Payment Details table (single row)
 */
export interface InvoicePaymentTableRow {
  paymentMethod: string;
  cardholderName: string;
  accountNumber: string;
  noOfPackages: number | string;
}

/**
 * Get payment details columns for Invoice Details Modal (paid status)
 * Table: Payment Method, Cardholder's Name, Card Number, No of Packages
 */
export function getInvoicePaymentTableColumns(): Column<InvoicePaymentTableRow>[] {
  return [
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      mobileOrder: 1,
      cell: (row) => (
        <span className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200">
          {row.paymentMethod}
        </span>
      ),
    },
    {
      key: 'cardholderName',
      header: "Cardholder's Name",
      mobileOrder: 2,
      cell: (row) => (
        <Typography variant="body" weight="medium" className="text-gray-900">
          {row.cardholderName}
        </Typography>
      ),
    },
    {
      key: 'accountNumber',
      header: 'Card Number',
      mobileOrder: 3,
      cell: (row) => (
        <Typography variant="body" weight="medium" className="text-gray-900">
          {row.accountNumber}
        </Typography>
      ),
    },
    {
      key: 'noOfPackages',
      header: 'No of Packages',
      mobileOrder: 4,
      cell: (row) => (
        <Typography variant="body" weight="medium" className="text-gray-900">
          {String(row.noOfPackages)}
        </Typography>
      ),
    },
  ];
}

/**
 * Get Services table columns for Invoice Details Modal
 * Package, Delivery ID, Tracking ID, Weight, Dimensions, Value
 */
export function getInvoiceServicesColumns(): Column<InvoiceServiceItem>[] {
  return [
    {
      key: 'package',
      header: 'Package',
      mobileOrder: 1,
      cell: (row) => (
        <Typography variant="caption" weight="medium" className="text-form-title">
          {row.package}
        </Typography>
      ),
    },
    {
      key: 'deliveryId',
      header: 'Delivery ID',
      mobileOrder: 2,
      cell: (row) => (
        <Typography variant="caption" weight="medium" className="text-form-title">
          {row.deliveryId}
        </Typography>
      ),
    },
    {
      key: 'trackingId',
      header: 'Tracking ID',
      mobileOrder: 3,
      cell: (row) => (
        <Typography variant="caption" weight="medium" className="text-form-title">
          {row.trackingId}
        </Typography>
      ),
    },
    {
      key: 'weight',
      header: 'Weight',
      mobileOrder: 4,
      cell: (row) => (
        <Typography variant="caption" weight="medium" className="text-form-title">
          {row.weight}
        </Typography>
      ),
    },
    {
      key: 'dimensions',
      header: 'Dimensions',
      mobileOrder: 5,
      cell: (row) => (
        <Typography variant="caption" weight="medium" className="text-form-title">
          {row.dimensions}
        </Typography>
      ),
    },
    {
      key: 'value',
      header: 'Value',
      mobileOrder: 6,
      cell: (row) => (
        <Typography variant="caption" weight="semibold" className="text-form-title">
          {row.value}
        </Typography>
      ),
    },
  ];
}
