import { Calendar } from 'lucide-react';
import Typography from '@/components/atoms/Typography';
import { PAYMENT_BILLING_ICON_CLASS, PAYMENT_BILLING_VALUE_CLASS } from '@/lib/paymentSettingsUi';
import { SETTINGS_FORM_CARD_CLASS } from '@/lib/settingsUi';
import { portalSectionDescClass } from '@/lib/portalTheme';
import { cn } from '@/lib/utils';

interface BillingScheduleRowProps {
  label?: string;
  value: string;
  className?: string;
}

export default function BillingScheduleRow({
  label = 'Billing Schedule',
  value,
  className,
}: BillingScheduleRowProps): React.JSX.Element {
  return (
    <div
      className={cn(SETTINGS_FORM_CARD_CLASS, 'flex items-center justify-between gap-4', className)}
    >
      <div className="min-w-0">
        <Typography className={portalSectionDescClass}>{label}</Typography>
        <Typography className={PAYMENT_BILLING_VALUE_CLASS}>{value}</Typography>
      </div>
      <Calendar className={PAYMENT_BILLING_ICON_CLASS} strokeWidth={1.25} aria-hidden />
    </div>
  );
}
