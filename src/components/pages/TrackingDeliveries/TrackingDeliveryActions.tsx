import * as React from 'react';
import { Button } from '@/components/atoms/Button';
import { Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingDeliveryActionsProps {
  onContactDriver?: () => void;
  onInstantTracking?: () => void;
  onViewDetails?: () => void;
  /** When true (e.g. status is Delivered), Contact + Instant Tracking are disabled */
  disabled?: boolean;
  className?: string;
}

/**
 * Tracking Delivery card actions row (Figma 4537-22692).
 * Contact Driver (outline), Instant Tracking (primary), Open in new tab (secondary, icon only).
 */
export default function TrackingDeliveryActions({
  onContactDriver,
  onInstantTracking,
  onViewDetails,
  disabled = false,
  className,
}: TrackingDeliveryActionsProps): React.JSX.Element {
  return (
    <div className={cn('flex w-full items-center gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-w-0"
        onClick={onContactDriver}
        disabled={disabled}
      >
        <Phone className="h-4 w-4 mr-2" />
        Contact Driver
      </Button>
      <Button
        variant="default"
        size="sm"
        className="flex-1 min-w-0"
        onClick={onInstantTracking}
        disabled={disabled}
      >
        <MapPin className="h-4 w-4 mr-2" />
        Instant Tracking
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="px-4 py-2 rounded-md"
        onClick={onViewDetails}
        aria-label="Open in new tab"
      >
        <ArrowUpRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
