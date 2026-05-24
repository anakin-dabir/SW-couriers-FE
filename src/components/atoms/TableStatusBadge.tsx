import { cn } from '@/lib/utils';
import Typography from './Typography';

type StatusType = 'paid' | 'unpaid' | 'overdue';

interface TableStatusBadgeProps {
  /** Status type */
  status: StatusType;
  /** Additional className */
  className?: string;
}

const STATUS_CONFIG: Record<StatusType, { label: string; colorClass: string }> = {
  paid: {
    label: 'Paid',
    colorClass: 'text-green-600',
  },
  unpaid: {
    label: 'Unpaid',
    colorClass: 'text-orange-600',
  },
  overdue: {
    label: 'Overdue',
    colorClass: 'text-red-600',
  },
};

/**
 * Atomic component for table status badge
 * Displays payment status with appropriate color
 */
export default function TableStatusBadge({
  status,
  className,
}: TableStatusBadgeProps): React.JSX.Element {
  const CONFIG = STATUS_CONFIG[status];

  return (
    <Typography variant="caption" weight="normal" className={cn(CONFIG.colorClass, className)}>
      {CONFIG.label}
    </Typography>
  );
}
