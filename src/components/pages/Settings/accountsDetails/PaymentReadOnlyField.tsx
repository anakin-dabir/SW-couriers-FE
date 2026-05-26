import Typography from '@/components/atoms/Typography';
import { portalFieldLabelClass } from '@/lib/portalTheme';
import { PAYMENT_READ_ONLY_VALUE_CLASS } from '@/lib/paymentSettingsUi';

interface PaymentReadOnlyFieldProps {
  label: string;
  value: string;
}

export default function PaymentReadOnlyField({
  label,
  value,
}: PaymentReadOnlyFieldProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <Typography variant="caption" className={portalFieldLabelClass}>
        {label}
      </Typography>
      <div className={PAYMENT_READ_ONLY_VALUE_CLASS}>{value}</div>
    </div>
  );
}
