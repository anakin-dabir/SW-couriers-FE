import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import type { PickupSelectableCardData } from '@/components/organisms/PickupSelectableCard';
import { PickupSelectableCard } from '@/components/organisms';
import { RECENT_PICKUP_DISPLAY, RECENT_PICKUP_TITLE } from '@/lib/data';
import { cn } from '@/lib/utils';

interface RecentPickupCardProps {
  /** Optional className */
  className?: string;
  /** Variant: 'default' for dashboard (full card), 'detail' for delivery detail page (compact header only) */
  variant?: 'default' | 'detail';
  /** Tracking ID (optional, uses RECENT_PICKUP_DISPLAY if not provided) */
  trackingId?: string;
  /** Status (optional, uses RECENT_PICKUP_DISPLAY if not provided) */
  status?: string;
  /** Callback when copy button is clicked */
  onCopyTrackingId?: () => void;
}

/**
 * RecentPickupCard molecule component.
 * Displays a single recent pickup with tracking details, route, ETA, and distance.
 * Matches Figma design 3838-22152 for default variant.
 * Matches Figma design 3838-22662 for detail variant (compact header only).
 */
export default function RecentPickupCard({
  className,
  variant = 'default',
  trackingId,
  status,
  onCopyTrackingId,
}: RecentPickupCardProps): React.JSX.Element {
  const navigate = useNavigate();
  const isDetailVariant = variant === 'detail';

  const displayTrackingId = trackingId ?? RECENT_PICKUP_DISPLAY.trackingId;
  const displayStatus = status ?? RECENT_PICKUP_DISPLAY.status;

  const handleViewDetails = (): void => {
    void navigate(`/deliveries/${displayTrackingId}`);
  };

  const handleCopyTrackingId = (): void => {
    if (onCopyTrackingId) {
      onCopyTrackingId();
    } else {
      void navigator.clipboard.writeText(displayTrackingId);
    }
  };

  const DATA: PickupSelectableCardData = {
    trackingId: displayTrackingId,
    status: displayStatus,
    origin: RECENT_PICKUP_DISPLAY.origin,
    destination: RECENT_PICKUP_DISPLAY.destination,
    eta: RECENT_PICKUP_DISPLAY.eta,
    distance: RECENT_PICKUP_DISPLAY.distance,
  };

  return (
    <div className={cn(className)}>
      <PickupSelectableCard
        data={DATA}
        title={isDetailVariant ? undefined : RECENT_PICKUP_TITLE}
        variant={variant}
        isSelected
        onViewDetails={() => handleViewDetails()}
        onCopyTrackingId={() => handleCopyTrackingId()}
      />
    </div>
  );
}
