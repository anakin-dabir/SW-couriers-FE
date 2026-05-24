import { CircleCheck, Loader, RotateCcw, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Typography from './Typography';
import type { DeliveryStatus } from '@/types/delivery';

/** Off-white text color for chip variant (readable on colored background) */
const CHIP_TEXT_COLOR = '#FAFAFA';

interface DeliveryStatusBadgeProps {
  /** Delivery status type */
  status: DeliveryStatus;
  /** Display variant: default (icon + colored text) or chip (colored bg, off-white text, no icon) */
  variant?: 'default' | 'chip';
  /** Additional className */
  className?: string;
}

const statusConfig: Partial<
  Record<
    DeliveryStatus,
    {
      label: string;
      color: string;
      iconColorClass: string;
      icon: React.ComponentType<{ className?: string; size?: number }>;
    }
  >
> = {
  pending: {
    label: 'Pending',
    color: '#FDA43C',
    iconColorClass: 'text-[#FDA43C]',
    icon: Loader,
  },
  'in-transit': {
    label: 'On-Route',
    color: '#357DE8',
    iconColorClass: 'text-[#357DE8]',
    icon: ChevronsRight,
  },
  delivered: {
    label: 'Delivered',
    color: '#34C759',
    iconColorClass: 'text-[#34C759]',
    icon: CircleCheck,
  },
  failed: {
    label: 'Returned',
    color: '#ED3A3A',
    iconColorClass: 'text-[#ED3A3A]',
    icon: RotateCcw,
  },
};

/**
 * Atomic component for delivery status badge
 * Displays delivery status with appropriate color and icon (default) or as a chip (colored bg, off-white text, no icon)
 */
export default function DeliveryStatusBadge({
  status,
  variant = 'default',
  className,
}: DeliveryStatusBadgeProps): React.JSX.Element {
  const config = statusConfig[status];

  if (!config) {
    // Fallback for unknown status
    return (
      <Typography variant="caption" weight="bold" className={className}>
        {status}
      </Typography>
    );
  }

  if (variant === 'chip') {
    return (
      <span
        className={cn(
          'inline-flex items-center  rounded-full px-2.5  py-0.5 text-xs font-bold',
          className
        )}
        style={{ backgroundColor: config.color, color: CHIP_TEXT_COLOR }}
      >
        {config.label}
      </span>
    );
  }

  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Icon className={cn('shrink-0', config.iconColorClass)} size={16} />
      <Typography variant="caption" weight="bold" style={{ color: config.color }}>
        {config.label}
      </Typography>
    </div>
  );
}
