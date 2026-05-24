import React, { useMemo } from 'react';
import { Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader } from '@/components/molecules/dialog';
import { Button } from '@/components/atoms/Button';
import {
  BillingModalHeader,
  BillingModalFooter,
  InvoiceDetailsBody,
  InvoiceStatusBadge,
  ModalLoadingState,
  ModalErrorState,
} from '@/components/molecules';
import type { InvoiceDetail } from '@/types/invoice';
import {
  MOCK_BILLING_DATA,
  STATEMENT_FOOTER_CONFIG,
  mapBillingInvoiceToInvoiceDetail,
} from '@/lib/data';
import { downloadInvoicePdf } from '@/lib/invoicePdf';

interface InvoiceDetailsModalProps {
  invoiceId: string | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onRetryPayment?: () => void;
  onChangePaymentMethod?: () => void;
  onDownloadInvoice?: () => void;
}

/**
 * InvoiceDetailsModal Organism
 *
 * Displays detailed invoice information in a modal
 * Controlled via URL params (invoiceId)
 */
export default function InvoiceDetailsModal({
  invoiceId,
  isOpen,
  onClose,
  isLoading = false,
  error = null,
  onRetry,
  onRetryPayment,
  onChangePaymentMethod,
  onDownloadInvoice,
}: InvoiceDetailsModalProps): React.JSX.Element {
  const invoice = useMemo<InvoiceDetail | null>(() => {
    if (!invoiceId || !isOpen) {
      return null;
    }

    const foundInvoice = MOCK_BILLING_DATA.find((inv) => inv.invoiceNumber === invoiceId);
    if (!foundInvoice) {
      return null;
    }
    return mapBillingInvoiceToInvoiceDetail(foundInvoice);
  }, [invoiceId, isOpen]);

  const handleClose = (): void => {
    onClose();
  };

  if (error) {
    return (
      <ModalErrorState
        isOpen={isOpen}
        onClose={handleClose}
        message="Failed to load invoice"
        description="Unable to fetch invoice details. Please try again."
        onRetry={onRetry}
        maxWidth="max-w-7xl"
      />
    );
  }

  if (isLoading || !invoice) {
    return (
      <ModalLoadingState
        isOpen={isOpen}
        onClose={handleClose}
        message="Loading invoice details..."
        maxWidth="max-w-7xl"
      />
    );
  }

  const isPaid = invoice.status === 'paid';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden gap-0 p-8">
        <DialogHeader className="shrink-0 pb-4">
          <BillingModalHeader
            heading={invoice.invoiceNumber}
            subheading={`Issue Date: ${invoice.issueDate}`}
            statusBadge={<InvoiceStatusBadge status={invoice.status} />}
            headingVariant="h3"
            headingWeight="semibold"
            subheadingClassName="text-sm text-gray-600"
            action={
              isPaid ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    void downloadInvoicePdf(invoice).then(() => onDownloadInvoice?.());
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
              ) : undefined
            }
          />
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto space-y-6">
          <InvoiceDetailsBody
            invoice={invoice}
            onRetryPayment={onRetryPayment}
            onChangePaymentMethod={onChangePaymentMethod}
          />

          {isPaid && <BillingModalFooter variant="statement" config={STATEMENT_FOOTER_CONFIG} />}
        </div>

        {!isPaid && (
          <div className="shrink-0 border-t border-gray-200 pt-4">
            <BillingModalFooter
              variant="actions"
              onCancel={handleClose}
              onDownloadInvoice={() => {
                void downloadInvoicePdf(invoice).then(() => onDownloadInvoice?.());
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
