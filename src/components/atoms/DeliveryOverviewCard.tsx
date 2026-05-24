import * as React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '@/components/molecules/card';
import Typography from './Typography';
import { cn } from '@/lib/utils';

interface DeliveryOverviewCardProps {
  /** Card label (e.g. "Out for Delivery") */
  label: string;
  /** Main value to display */
  value: string | number;
  /** Delta percentage change */
  delta: number;
  /** Delta direction: 'positive' for increase, 'negative' for decrease */
  deltaType: 'positive' | 'negative';
  /** Optional className */
  className?: string;
}

/**
 * DeliveryOverviewCard atom component.
 * Displays a single delivery metric with label, value, and delta percentage.
 * Matches Figma design 3838-22247.
 */
export default function DeliveryOverviewCard({
  label,
  value,
  delta,
  deltaType,
  className,
}: DeliveryOverviewCardProps): React.JSX.Element {
  const VALUE_DISPLAY = typeof value === 'number' ? value.toLocaleString() : value;
  const IS_POSITIVE = deltaType === 'positive';
  const DELTA_VALUE = IS_POSITIVE ? Math.abs(delta) : -Math.abs(delta);

  return (
    <Card className={cn('flex flex-col rounded-lg p-6 gap-4', className)}>
      <Typography variant="body" className="text-sm font-medium text-gray-900">
        {label}
      </Typography>
      <div className="flex items-center gap-1">
        <Typography variant="h4" weight="bold" className="text-2xl! font-bold! text-gray-900">
          {VALUE_DISPLAY}
        </Typography>
        <div className={cn('flex items-center', IS_POSITIVE ? 'text-success' : 'text-error')}>
          {IS_POSITIVE ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          <Typography
            variant="caption"
            className={cn('text-xs! font-medium', IS_POSITIVE ? 'text-success' : 'text-error!')}
          >
            {DELTA_VALUE}
          </Typography>
        </div>
      </div>
    </Card>
  );
}
