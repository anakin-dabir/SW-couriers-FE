import React, { useMemo } from 'react';
import { Download } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { Dialog, DialogContent, DialogHeader } from '@/components/molecules/dialog';
import { Button } from '@/components/atoms/Button';
import {
  BillingModalHeader,
  BillingModalFooter,
  StatementOverviewSection,
  StatementInvoicesSection,
  SummarySection,
  ModalLoadingState,
  ModalErrorState,
} from '@/components/molecules';
import { SectionModalSectionWrapper, Typography } from '@/components/atoms';
import {
  MOCK_BILLING_DATA,
  STATEMENT_DUMMY_INVOICES,
  STATEMENT_FOOTER_CONFIG,
  getStatementSummaryItems,
} from '@/lib/data';
import { filterBillingData } from '@/lib/billing';
import { downloadStatementPdf } from '@/lib/statementPdf';
import {
  formatCurrency,
  formatStatementDateRange,
  calculateStatementMetrics,
  type StatementMetrics,
} from '@/lib/utils';
import { type OverviewRow } from '@/lib/tableContentTransformer';
import type { BillingInvoice } from '@/types/billing';

interface StatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateRange?: DateRange;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onDownloadStatement?: () => void;
}

/**
 * StatementModal Organism
 *
 * Displays statement information for a date range in a modal
 * Shows customer info, overview metrics, invoice details table, and summary totals
 */
export default function StatementModal({
  isOpen,
  onClose,
  dateRange,
  isLoading = false,
  error = null,
  onRetry,
  onDownloadStatement,
}: StatementModalProps): React.JSX.Element {
  const statementData = useMemo<BillingInvoice[]>(() => {
    if (!dateRange) {
      return [];
    }
    const filtered = filterBillingData(MOCK_BILLING_DATA, dateRange, { search: '', status: '' });
    return filtered.length > 0 ? filtered : STATEMENT_DUMMY_INVOICES;
  }, [dateRange]);

  const metrics = useMemo<StatementMetrics>(() => {
    return calculateStatementMetrics(statementData);
  }, [statementData]);

  const handleClose = (): void => {
    onClose();
  };

  const summaryItems = getStatementSummaryItems(metrics);

  if (error) {
    return (
      <ModalErrorState
        isOpen={isOpen}
        onClose={handleClose}
        message="Failed to load statement"
        description="Unable to fetch statement data. Please try again."
        onRetry={onRetry}
        maxWidth="max-w-7xl"
      />
    );
  }

  if (isLoading) {
    return (
      <ModalLoadingState
        isOpen={isOpen}
        onClose={handleClose}
        message="Loading statement..."
        maxWidth="max-w-7xl"
      />
    );
  }

  const OVERVIEW_DATA: OverviewRow[] = [
    {
      totalPaid: formatCurrency(metrics.totalPaid),
      totalUnpaid: formatCurrency(metrics.totalUnpaid),
      totalOverdue: formatCurrency(metrics.totalOverdue),
      overdueInvoices: String(metrics.overdueInvoices),
      totalInvoiceAmount: formatCurrency(metrics.totalInvoiceAmount),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden gap-0 p-8">
        <DialogHeader className="shrink-0 pb-6">
          <BillingModalHeader
            heading="Statement"
            subheading={formatStatementDateRange(dateRange)}
            action={
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  void downloadStatementPdf(dateRange, statementData).then(() =>
                    onDownloadStatement?.()
                  );
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Statement
              </Button>
            }
            className="mb-6"
          />
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-8 overflow-y-auto">
          {/* Bill To section */}
          <SectionModalSectionWrapper title="Bill To">
            <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1">
                  <Typography variant="caption" color="muted" className="text-gray-500">
                    Company name
                  </Typography>
                  <Typography variant="body" weight="semibold" className="text-gray-900">
                    Opus Retail Ltd
                  </Typography>
                </div>
                <div className="flex flex-col gap-1">
                  <Typography variant="caption" color="muted" className="text-gray-500">
                    Email
                  </Typography>
                  <Typography variant="body" weight="medium" className="text-gray-900">
                    accounts@shiftopus.co.uk
                  </Typography>
                </div>
                <div className="flex flex-col gap-1">
                  <Typography variant="caption" color="muted" className="text-gray-500">
                    Address
                  </Typography>
                  <Typography variant="body" weight="medium" className="text-gray-900">
                    55 Bridge End, Cardiff, CF10 2BN, United Kingdom
                  </Typography>
                </div>
              </div>
            </div>
          </SectionModalSectionWrapper>

          <StatementOverviewSection overviewData={OVERVIEW_DATA} />
          <StatementInvoicesSection invoices={statementData} />
          <SummarySection
            items={summaryItems}
            align="right"
            spacing="compact"
            className="text-right"
          />
          <BillingModalFooter variant="statement" config={STATEMENT_FOOTER_CONFIG} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
