import * as React from 'react';
import { ChartLegendItem } from '@/components/atoms';
import type { DeliveryStatusData } from '@/types/delivery';
import { cn } from '@/lib/utils';

interface DeliveryStatusLegendProps {
  /** Legend items data */
  items: DeliveryStatusData[];
  /** Optional className */
  className?: string;
}

/**
 * DeliveryStatusLegend molecule component.
 * Displays a vertical list of legend items with colored dots and labels.
 * Used in DeliveryStatusCard.
 */
export default function DeliveryStatusLegend({
  items,
  className,
}: DeliveryStatusLegendProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {items.map((item) => (
        <ChartLegendItem key={item.name} label={item.name} color={item.color} />
      ))}
    </div>
  );
}
