import * as React from 'react';
import { MetaLabelValue } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface TrackingDeliveryMetaGridRow1 {
  postcode: string;
  eta: string;
  distance: string;
  status: string;
}

interface TrackingDeliveryMetaGridRow2 {
  weight: string;
  numberOfPackages: string;
}

interface TrackingDeliveryMetaGridProps {
  row1: TrackingDeliveryMetaGridRow1;
  row2: TrackingDeliveryMetaGridRow2;
  className?: string;
}

/**
 * Tracking Delivery card meta grid (Figma 4537-22692).
 * Single grid: 2 rows × 4 columns.
 */
export default function TrackingDeliveryMetaGrid({
  row1,
  row2,
  className,
}: TrackingDeliveryMetaGridProps): React.JSX.Element {
  return (
    <div className={cn('grid grid-cols-4 gap-4', className)}>
      <MetaLabelValue label="Postcode" value={row1.postcode} />
      <MetaLabelValue label="ETA" value={row1.eta} />
      <MetaLabelValue label="Distance" value={row1.distance} />
      <MetaLabelValue label="Status" value={row1.status} />
      <MetaLabelValue label="Weight" value={row2.weight} />
      <MetaLabelValue label="No. of Packages" value={row2.numberOfPackages} />
      <div aria-hidden />
      <div aria-hidden />
    </div>
  );
}
