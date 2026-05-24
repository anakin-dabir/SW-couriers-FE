import { DataTable } from '@/components/molecules';
import { SectionModalSectionWrapper } from '@/components/atoms';
import { getStatementOverviewColumns, type OverviewRow } from '@/lib/tableContentTransformer';

interface StatementOverviewSectionProps {
  overviewData: OverviewRow[];
}

/**
 * StatementOverviewSection Molecule
 *
 * Overview section for Statement Modal
 * Displays metrics in a table format
 */
export default function StatementOverviewSection({
  overviewData,
}: StatementOverviewSectionProps): React.JSX.Element {
  const OVERVIEW_COLUMNS = getStatementOverviewColumns();

  return (
    <SectionModalSectionWrapper title="Overview">
      <DataTable
        columns={OVERVIEW_COLUMNS}
        data={overviewData}
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
        showPagination={false}
        getRowKey={() => 'overview'}
      />
    </SectionModalSectionWrapper>
  );
}
