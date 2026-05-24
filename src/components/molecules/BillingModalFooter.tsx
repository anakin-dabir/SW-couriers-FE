import { Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { InvoiceMetaRow } from '@/components/molecules';
import { SwCouriersLogo } from '@/assets/svg';

/** Config for the statement/slip footer (logo, contact, shipment text). Used by StatementModal and DeliveryInvoiceModal. */
export interface StatementFooterConfig {
  logoAlt: string;
  emailLabel: string;
  email: string;
  contactLabel: string;
  contactValue: string;
  addressLabel: string;
  addressValue: string;
  shipmentHeading: string;
  shipmentLines: string[];
}

interface BillingModalFooterStatementProps {
  variant: 'statement';
  config: StatementFooterConfig;
}

interface BillingModalFooterActionsProps {
  variant: 'actions';
  onCancel: () => void;
  onDownloadInvoice?: () => void;
}

export type BillingModalFooterProps =
  | BillingModalFooterStatementProps
  | BillingModalFooterActionsProps;

/**
 * BillingModalFooter Molecule
 *
 * Generic footer for billing/invoice modals.
 * - variant="statement": logo, contact info, shipment charges (shared by StatementModal and DeliveryInvoiceModal).
 * - variant="actions": Cancel and Download Invoice buttons (InvoiceDetailsModal).
 */
export default function BillingModalFooter(props: BillingModalFooterProps): React.JSX.Element {
  if (props.variant === 'statement') {
    const { config } = props;
    return (
      <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200 gap-10">
        <div>
          <img src={SwCouriersLogo} alt={config.logoAlt} className="h-10 w-14 mb-2.5" />
          <div className="space-y-3.5">
            <div className="flex flex-col">
              <Typography variant="caption" color="muted" className="text-2xs! text-gray-500!">
                {config.emailLabel}
              </Typography>
              <Typography variant="body" weight="semibold" className="text-sm! text-blue-600!">
                {config.email}
              </Typography>
            </div>
            <InvoiceMetaRow
              label={config.contactLabel}
              value={config.contactValue}
              variant="xsmall"
            />
            <InvoiceMetaRow
              label={config.addressLabel}
              value={config.addressValue}
              variant="xsmall"
            />
          </div>
        </div>
        <div className="max-w-md">
          <Typography variant="body" weight="semibold" className="text-xs text-gray-900! mb-2">
            {config.shipmentHeading}
          </Typography>
          <div className="space-y-1 text-gray-600!">
            {config.shipmentLines.map((line, index) => (
              <Typography key={index} variant="caption" className="text-xs text-gray-600!">
                {line}
              </Typography>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { onCancel, onDownloadInvoice } = props;
  return (
    <div className="flex justify-between gap-4 pt-6">
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      {onDownloadInvoice != null && (
        <Button variant="default" onClick={onDownloadInvoice}>
          Download Invoice
        </Button>
      )}
    </div>
  );
}
