import { Typography } from '@/components/atoms';
import { MetaInfoGrid, DataTable, SummarySection } from '@/components/molecules';
import { getDeliveryInvoiceServicesColumns } from '@/lib/tableContentTransformer';
import type { DeliveryInvoice } from '@/types/invoice';

interface DeliveryInvoiceBodyProps {
  invoice: DeliveryInvoice;
}

/**
 * DeliveryInvoiceBody Molecule
 *
 * Body content section for Delivery Invoice Modal
 * Contains customer info, services table, and summary
 */
export default function DeliveryInvoiceBody({
  invoice,
}: DeliveryInvoiceBodyProps): React.JSX.Element {
  const CUSTOMER_INFO_ITEMS = [
    {
      label: 'Customer Name',
      value: invoice.customerName,
    },
    {
      label: 'Customer Contact',
      value: invoice.customerContact,
    },
    {
      label: 'Issued on',
      value: invoice.issuedDate,
    },
    {
      label: 'Payment Date',
      value: invoice.paymentDate,
    },
  ];

  const SUMMARY_ITEMS = [
    { label: 'Fuel Subcharge', value: invoice.fuelSurcharge },
    { label: 'VAT 20%', value: invoice.vat },
    { label: 'Total', value: invoice.total, isTotal: true },
  ];

  return (
    <div className="space-y-8">
      {/* Customer Information Section */}
      <div className="pt-6">
        <MetaInfoGrid items={CUSTOMER_INFO_ITEMS} layout="custom" rightColumnAlign="right" />
      </div>

      {/* Services Section */}
      <div>
        <Typography variant="h5" weight="semibold" className="text-lg text-gray-900 mb-4">
          Services
        </Typography>
        <DataTable
          columns={getDeliveryInvoiceServicesColumns()}
          data={invoice.services}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          showPagination={false}
          getRowKey={(_row, index) => String(index)}
        />
      </div>

      {/* Summary Section */}
      <SummarySection
        items={SUMMARY_ITEMS}
        align="right"
        spacing="compact"
        className="text-right"
      />
    </div>
  );
}
