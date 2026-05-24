import { TableStatusBadge, Typography } from '@/components/atoms';
import TableActionMenu from './TableActionMenu';
import type { BillingInvoice } from '@/types/billing';
import type { Column } from '@/types/datatable';
import { getBillingActionsForStatus } from '@/lib/billing';

interface GetBillingTableColumnsOptions {
  onInvoiceClick?: (invoiceNumber: string) => void;
}

/**
 * Get billing table column definitions
 */
export function getBillingTableColumns(
  options?: GetBillingTableColumnsOptions
): Column<BillingInvoice>[] {
  const { onInvoiceClick } = options || {};
  return [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      mobileOrder: 1,
      cell: (row: BillingInvoice) => (
        <Typography variant="caption" weight="medium" className="text-form-title">
          {row.invoiceNumber}
        </Typography>
      ),
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      mobileOrder: 2,
      cell: (row: BillingInvoice) => (
        <Typography variant="caption" weight="medium" className="text-form-title">
          {row.issueDate}
        </Typography>
      ),
    },
    {
      key: 'deliveryRef',
      header: 'Delivery Ref',
      mobileOrder: 3,
      cell: (row: BillingInvoice) => (
        <Typography variant="caption" weight="medium" className="text-form-title capitalize">
          {row.deliveryRef}
        </Typography>
      ),
    },
    {
      key: 'value',
      header: 'Value',
      mobileOrder: 4,
      cell: (row: BillingInvoice) => (
        <Typography variant="caption" weight="semibold" className="text-form-title">
          {row.value}
        </Typography>
      ),
    },
    {
      key: 'paymentDate',
      header: 'Payment Date',
      mobileOrder: 5,
      cell: (row: BillingInvoice) => (
        <Typography variant="caption" weight="semibold" className="text-form-title">
          {row.paymentDate}
        </Typography>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      mobileOrder: 6,
      cell: (row: BillingInvoice) => <TableStatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      mobileOrder: 99,
      cell: (row: BillingInvoice) => (
        <TableActionMenu actions={getBillingActionsForStatus(row.status, row, onInvoiceClick)} />
      ),
    },
  ];
}
