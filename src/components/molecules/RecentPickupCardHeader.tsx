import * as React from 'react';
import PickupCardHeader from './PickupCardHeader';

interface RecentPickupCardHeaderProps {
  /** Tracking ID value */
  trackingId: string;
  /** Status text for badge */
  status: string;
  /** Callback when copy button is clicked */
  onCopyTrackingId?: () => void;
  /** Optional className */
  className?: string;
  /** Variant: 'default' for dashboard, 'detail' for delivery detail page */
  variant?: 'default' | 'detail';
  /** Label text (default: 'Tracking ID' for default variant, 'DELIVERY ID' for detail variant) */
  label?: string;
}

/**
 * RecentPickupCardHeader molecule component.
 * Displays package icon, tracking ID label, value, copy button, and status badge.
 * Used in RecentPickupCard.
 * Variant 'detail' matches Figma design 3838-22662.
 */
export default function RecentPickupCardHeader({
  trackingId,
  status,
  onCopyTrackingId,
  className,
  variant = 'default',
  label,
}: RecentPickupCardHeaderProps): React.JSX.Element {
  return (
    <PickupCardHeader
      trackingId={trackingId}
      status={status}
      onCopyTrackingId={onCopyTrackingId}
      className={className}
      variant={variant}
      label={label}
    />
  );
}
