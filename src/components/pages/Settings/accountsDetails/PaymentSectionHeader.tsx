import type { ReactNode } from 'react';
import Typography from '@/components/atoms/Typography';
import {
  PAYMENT_SECTION_DESC_CLASS,
  PAYMENT_SECTION_HEADER_CLASS,
  PAYMENT_SECTION_TITLE_CLASS,
} from '@/lib/paymentSettingsUi';
import { cn } from '@/lib/utils';

interface PaymentSectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function PaymentSectionHeader({
  title,
  description,
  action,
  className,
}: PaymentSectionHeaderProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-3',
        PAYMENT_SECTION_HEADER_CLASS,
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <Typography className={PAYMENT_SECTION_TITLE_CLASS}>{title}</Typography>
        {description ? (
          <Typography className={PAYMENT_SECTION_DESC_CLASS}>{description}</Typography>
        ) : null}
      </div>
      {action ?? null}
    </div>
  );
}
