import { Info } from 'lucide-react';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';

type PaymentAlertVariant = 'immediate' | 'monthly' | 'required';

interface PaymentAlertProps {
  variant: PaymentAlertVariant;
  className?: string;
}

const ALERT_CONFIG: Record<PaymentAlertVariant, { line1: string; line2?: string }> = {
  immediate: {
    line1: "You'll be charged in the next 10 minutes.",
  },
  monthly: {
    line1: "You'll be charged on the 1st of each month.",
    line2: '(This pickup will be added to your monthly invoice.)',
  },
  required: {
    line1: 'Payment details are required before your pickup can be scheduled.',
  },
};

/**
 * PaymentAlert Atom
 *
 * Info alert for payment method step (Figma 5030-30375, 5030-30519, 5031-14464).
 * Three variants: immediate, monthly, required.
 */
export default function PaymentAlert({ variant, className }: PaymentAlertProps): React.JSX.Element {
  const config = ALERT_CONFIG[variant];

  return (
    <div className={cn('flex items-start gap-2.5 rounded-md bg-blue-500/10 p-2', className)}>
      <Info className="size-6 shrink-0 text-blue-950" />
      <div className="flex flex-1 flex-col">
        <Typography variant="body" weight="medium" className="text-sm leading-5 text-blue-950">
          {config.line1}
        </Typography>
        {config.line2 && (
          <Typography
            variant="body"
            weight="medium"
            className="text-sm italic leading-5 text-blue-900"
          >
            {config.line2}
          </Typography>
        )}
      </div>
    </div>
  );
}
