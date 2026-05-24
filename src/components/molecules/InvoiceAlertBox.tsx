import { Alert, AlertTitle, AlertDescription } from '@/components/atoms/alert';
import { Button } from '@/components/atoms/Button';
import { Typography } from '@/components/atoms';
import type { PaymentStatus } from '@/types/billing';
import { cn } from '@/lib/utils';

interface InvoiceAlertBoxProps {
  status: PaymentStatus;
  onRetryPayment?: () => void;
  onChangePaymentMethod?: () => void;
}

/**
 * InvoiceAlertBox Molecule
 *
 * Displays alert for unpaid and overdue invoices
 * Renders nothing for paid invoices
 */
export default function InvoiceAlertBox({
  status,
  onRetryPayment,
  onChangePaymentMethod,
}: InvoiceAlertBoxProps): React.JSX.Element | null {
  if (status === 'paid') {
    return null;
  }

  const IS_OVERDUE = status === 'overdue';

  const ALERT_CONFIG = IS_OVERDUE
    ? {
        variant: 'destructive' as const,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: '[&>svg]:text-red-600',
        title: 'Payment Overdue',
        titleColor: 'text-red-700',
        description:
          'Your payment could not be processed. Please retry to avoid service interruption.',
        descriptionColor: 'text-gray-700',
        primaryButtonClasses: 'hover:bg-red-700! bg-red-600! text-white w-full',
        outlineButtonClasses:
          'hover:bg-red-50! border-red-600! text-red-600! bg-transparent! w-full sm:w-auto',
      }
    : {
        variant: 'warning' as const,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: '[&>svg]:text-orange-600',
        title: 'Payment Failed',
        titleColor: 'text-orange-800',
        description: 'Payment failed due to network error. Try again in a few minutes.',
        descriptionColor: 'text-orange-700',
        primaryButtonClasses: 'hover:bg-orange-700! bg-orange-400! text-white w-full',
        outlineButtonClasses:
          'hover:bg-orange-50! border-orange-400! text-orange-400! bg-transparent! w-full sm:w-auto',
      };

  return (
    <Alert
      variant={ALERT_CONFIG.variant}
      className={cn('mt-6', ALERT_CONFIG.bgColor, ALERT_CONFIG.borderColor, ALERT_CONFIG.iconColor)}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between justify-start items-center gap-2">
        <AlertTitle className="w-full sm:w-auto">
          <Typography variant="h6" weight="semibold" className={ALERT_CONFIG.titleColor}>
            {ALERT_CONFIG.title}
          </Typography>
          <Typography variant="body" className={ALERT_CONFIG.descriptionColor}>
            {ALERT_CONFIG.description}
          </Typography>
        </AlertTitle>
        <AlertDescription className="w-full sm:w-auto">
          <div className="flex flex-col gap-4 sm:border-none border-t border-gray-200 pt-4 sm:pt-0">
            {(onRetryPayment || onChangePaymentMethod) && (
              <div className="flex sm:flex-col flex-row gap-2 items-end">
                {onRetryPayment && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onRetryPayment}
                    className={ALERT_CONFIG.primaryButtonClasses}
                  >
                    Retry Payment
                  </Button>
                )}
                {onChangePaymentMethod && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onChangePaymentMethod}
                    className={ALERT_CONFIG.outlineButtonClasses}
                  >
                    Change Payment Method
                  </Button>
                )}
              </div>
            )}
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
}
