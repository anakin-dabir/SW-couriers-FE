import * as React from 'react';
import PickupCardHeader from '@/components/molecules/PickupCardHeader';
import { cn } from '@/lib/utils';

interface TrackingDeliveryCardHeaderProps {
  trackingId: string;
  status: string;
  onCopyTrackingId?: () => void;
  className?: string;
}

/**
 * Tracking Delivery card header (Figma 4537-22692).
 * Reuses PickupCardHeader — same layout, typography, spacing, badge as Recent Pickup.
 */
export default function TrackingDeliveryCardHeader({
  trackingId,
  status,
  onCopyTrackingId,
  className,
}: TrackingDeliveryCardHeaderProps): React.JSX.Element {
  const statusLower = status.toLowerCase();
  const badgeVariant: 'success' | 'info' | 'warning' = statusLower.includes('delivered')
    ? 'success'
    : statusLower.includes('route') || statusLower.includes('on route')
      ? 'info'
      : 'warning';

  return (
    <PickupCardHeader
      trackingId={trackingId}
      status={status}
      onCopyTrackingId={onCopyTrackingId}
      className={cn(className)}
      variant="default"
      label="Tracking ID"
      badgeVariant={badgeVariant}
    />
  );
}
