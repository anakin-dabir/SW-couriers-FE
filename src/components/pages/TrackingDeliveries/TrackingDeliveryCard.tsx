import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/molecules/card';
import { UserAvatar, Typography } from '@/components/atoms';
import TrackingDeliveryCardHeader from './TrackingDeliveryCardHeader';
import TrackingDeliveryMetaGrid from './TrackingDeliveryMetaGrid';
import TrackingDeliveryActions from './TrackingDeliveryActions';
import { cn } from '@/lib/utils';
import type { TrackingDeliveryCardData } from '@/types/delivery';

interface TrackingDeliveryCardProps {
  data: TrackingDeliveryCardData;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onCopyTrackingId?: (trackingId: string) => void;
  onContactDriver?: (id: string) => void;
  onInstantTracking?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  className?: string;
}

/**
 * Tracking Delivery card organism (Figma 4537-22692).
 * Header, divider, meta grid (Row 1 + Row 2), driver section, actions row.
 */
export default function TrackingDeliveryCard({
  data,
  isSelected = false,
  onSelect,
  onCopyTrackingId,
  onContactDriver,
  onInstantTracking,
  onViewDetails,
  className,
}: TrackingDeliveryCardProps): React.JSX.Element {
  const IS_DELIVERED = data.status.toLowerCase() === 'delivered';
  const handleCopy = (): void => {
    if (onCopyTrackingId) {
      onCopyTrackingId(data.trackingId);
      return;
    }
    void navigator.clipboard.writeText(data.trackingId);
  };

  const handleSelect = (): void => {
    onSelect?.(data.id);
  };

  const META_ROW_1 = {
    postcode: data.postcode,
    eta: data.eta,
    distance: data.distance,
    status: data.status,
  };

  const META_ROW_2 = {
    weight: data.weight,
    numberOfPackages: data.numberOfPackages,
  };

  return (
    <Card
      className={cn('flex h-full flex-col transition-shadow', isSelected && 'shadow-lg', className)}
      onClick={handleSelect}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') handleSelect();
            }
          : undefined
      }
    >
      <CardHeader className="pb-3">
        <TrackingDeliveryCardHeader
          trackingId={data.trackingId}
          status={data.status}
          onCopyTrackingId={handleCopy}
        />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        <div className="border-t border-gray-200" aria-hidden />

        <TrackingDeliveryMetaGrid row1={META_ROW_1} row2={META_ROW_2} />

        <div className="flex items-center gap-3">
          <UserAvatar
            avatar={data.driverAvatar}
            name={data.driverName}
            className="h-10 w-10 shrink-0"
          />
          <div className="flex flex-col gap-0.5">
            <Typography variant="caption" className="text-xs uppercase text-gray-500">
              Driver
            </Typography>
            <Typography variant="body" className="text-base font-medium text-gray-900">
              {data.driverName}
            </Typography>
          </div>
        </div>

        <TrackingDeliveryActions
          onContactDriver={() => onContactDriver?.(data.id)}
          onInstantTracking={() => onInstantTracking?.(data.id)}
          onViewDetails={() => onViewDetails?.(data.id)}
          disabled={IS_DELIVERED}
        />
      </CardContent>
    </Card>
  );
}
