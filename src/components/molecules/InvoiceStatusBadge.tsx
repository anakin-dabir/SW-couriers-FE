import { Badge } from '@/components/atoms/badge';
import type { PaymentStatus } from '@/types/billing';

interface InvoiceStatusBadgeProps {
  status: PaymentStatus;
}

/**
 * InvoiceStatusBadge Molecule
 *
 * Displays invoice status with appropriate badge variant
 */
export default function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps): React.JSX.Element {
  const getVariant = (): 'success' | 'warning' | 'destructive' => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'unpaid':
        return 'warning';
      case 'overdue':
        return 'destructive';
      default:
        return 'warning';
    }
  };

  const getLabel = (): string => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'unpaid':
        return 'Unpaid';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  return <Badge variant={getVariant()}>{getLabel()}</Badge>;
}
