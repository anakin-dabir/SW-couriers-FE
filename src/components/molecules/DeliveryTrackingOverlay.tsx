import * as React from 'react';
import { ChevronsLeft } from 'lucide-react';
import { Card } from '@/components/molecules/card';
import { TruckRunning } from '@/assets/svg';
import MapMetricCard from './MapMetricCard';
import { DELIVERY_TRACKING_OVERLAY_CARDS } from '@/lib/data';
import { cn } from '@/lib/utils';

interface DeliveryTrackingOverlayProps {
  /** Optional className */
  className?: string;
}

/**
 * DeliveryTrackingOverlay molecule component.
 * Displays an overlay card on top of the delivery tracking map.
 * Contains header with truck icon, address, chevron, and three metric sections.
 * Matches Figma design 490-235 14.
 */
export default function DeliveryTrackingOverlay({
  className,
}: DeliveryTrackingOverlayProps): React.JSX.Element {
  return (
    <Card
      className={cn(
        'absolute left-5 right-5 top-4 z-10',
        'flex flex-col gap-4',
        'p-4 shadow-md',
        'w-auto max-w-full',

        className
      )}
    >
      {/* Content: Current distance + Metric cards */}
      <div className="flex flex-row items-center gap-3 sm:gap-4">
        {/* Header: Truck icon + Address */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <TruckRunning className="shrink-0" width="51" height="28" />
          <ChevronsLeft className="h-4 w-4 shrink-0 text-primary md:h-5 md:w-5" />
        </div>

        {/* Metric cards (right sections) */}
        <div className="flex flex-row gap-3 sm:gap-4 w-full">
          {DELIVERY_TRACKING_OVERLAY_CARDS.map((card) => (
            <MapMetricCard key={card.id} label={card.label} value={card.value} />
          ))}
        </div>
      </div>
    </Card>
  );
}
