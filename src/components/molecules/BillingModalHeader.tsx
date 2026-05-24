import type { ReactNode } from 'react';
import { DialogTitle } from '@/components/molecules/dialog';
import { Typography } from '@/components/atoms';
import { SwCouriersLogo } from '@/assets/svg';

export interface BillingModalHeaderProps {
  /** Main heading (e.g. "Statement", invoice number, "Delivery Invoice Inv-1004") */
  heading: string;
  /** Optional subheading (e.g. date range, issue date, reference number) */
  subheading?: string;
  /** Optional status badge (e.g. InvoiceStatusBadge) */
  statusBadge?: ReactNode;
  /** Optional action button(s) (e.g. Download Statement, Download Invoice) */
  action?: ReactNode;
  /** Optional className for the header container (e.g. mb-6 vs mb-4) */
  className?: string;
  /** Heading typography variant (default h2 for Statement, h3 for invoice modals) */
  headingVariant?: 'h2' | 'h3';
  /** Heading font weight (default bold for Statement, semibold for invoice modals) */
  headingWeight?: 'bold' | 'semibold';
  /** Optional subheading className (e.g. text-sm for invoice modals) */
  subheadingClassName?: string;
}

/**
 * BillingModalHeader Molecule
 *
 * Generic header for Statement, Invoice Details, and Delivery Invoice modals.
 * Shared logo, heading, subheading, optional status badge, and optional action buttons.
 */
export default function BillingModalHeader({
  heading,
  subheading,
  statusBadge,
  action,
  className = 'mb-4',
  headingVariant = 'h2',
  headingWeight = 'bold',
  subheadingClassName = 'text-base text-gray-600',
}: BillingModalHeaderProps): React.JSX.Element {
  return (
    <div className={`flex items-start justify-between ${className}`}>
      <div className="flex items-center gap-4">
        <img src={SwCouriersLogo} alt="SW Couriers" className="h-14 w-20 shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <DialogTitle asChild>
              <Typography
                variant={headingVariant}
                weight={headingWeight}
                className="text-2xl text-gray-900"
              >
                {heading}
              </Typography>
            </DialogTitle>
            {statusBadge}
          </div>
          {subheading && (
            <Typography variant="caption" color="muted" className={subheadingClassName}>
              {subheading}
            </Typography>
          )}
        </div>
      </div>
      {action != null && <div className="shrink-0">{action}</div>}
    </div>
  );
}
