import { EmptyState } from '@/components/atoms';
import { DataTable } from '@/components/molecules';
import { SectionModalSectionWrapper } from '@/components/atoms';
import { getStatementInvoiceColumns } from '@/lib/tableContentTransformer';
import type { BillingInvoice } from '@/types/billing';

interface StatementInvoicesSectionProps {
  invoices: BillingInvoice[];
}

/**
 * StatementInvoicesSection Molecule
 *
 * Invoices details section for Statement Modal
 * Displays invoice table with empty state handling
 */
export default function StatementInvoicesSection({
  invoices,
}: StatementInvoicesSectionProps): React.JSX.Element {
  const INVOICE_COLUMNS = getStatementInvoiceColumns();

  return (
    <SectionModalSectionWrapper title="Invoices Details">
      {invoices.length === 0 ? (
        <EmptyState
          message="No invoices found"
          description="No invoices match the selected date range."
        />
      ) : (
        <DataTable
          columns={INVOICE_COLUMNS}
          data={invoices}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          showPagination={false}
          getRowKey={(row) => row.id}
        />
      )}
    </SectionModalSectionWrapper>
  );
}
