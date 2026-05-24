import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/molecules/card';
import { Button } from '@/components/atoms/Button';
import {
  DashboardCardHeader,
  PickupCardHeader,
  PickupCardMetaSection,
} from '@/components/molecules';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PickupSelectableCardData {
  trackingId: string;
  status: string;
  origin: string;
  destination: string;
  eta: string;
  distance: string;
}

interface PickupSelectableCardProps {
  data: PickupSelectableCardData;
  variant?: 'default' | 'detail';
  title?: string;
  isSelected?: boolean;
  onSelect?: (trackingId: string) => void;
  onCopyTrackingId?: (trackingId: string) => void;
  onViewDetails?: (trackingId: string) => void;
  onViewAll?: () => void;
  className?: string;
}

export default function PickupSelectableCard({
  data,
  variant = 'default',
  title,
  isSelected = true,
  onSelect,
  onCopyTrackingId,
  onViewDetails,
  onViewAll,
  className,
}: PickupSelectableCardProps): React.JSX.Element {
  const isDetailVariant = variant === 'detail';

  const handleCopy = (): void => {
    if (onCopyTrackingId) {
      onCopyTrackingId(data.trackingId);
      return;
    }
    void navigator.clipboard.writeText(data.trackingId);
  };

  const handleViewDetails = (): void => {
    onViewDetails?.(data.trackingId);
  };

  const handleSelect = (): void => {
    onSelect?.(data.trackingId);
  };

  if (isDetailVariant) {
    return (
      <div className={cn('w-full', className)}>
        <PickupCardHeader
          trackingId={data.trackingId}
          status={data.status}
          onCopyTrackingId={handleCopy}
          variant="detail"
        />
      </div>
    );
  }

  const headerActions = (
    <Button variant="outline" size="sm" onClick={onViewAll} disabled={!isSelected}>
      View All
      <ArrowRight className="h-4 w-4 ml-2" />
    </Button>
  );

  return (
    <Card
      className={cn('flex h-full flex-col', !isSelected && 'opacity-60', className)}
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
      <CardHeader className="pb-4">
        {title ? <DashboardCardHeader title={title} actions={headerActions} /> : null}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        <div className="flex h-full flex-1 flex-col justify-between gap-4 p-3 border rounded-md border-gray-200">
          <PickupCardHeader
            trackingId={data.trackingId}
            status={data.status}
            onCopyTrackingId={handleCopy}
            variant="default"
          />

          <PickupCardMetaSection
            origin={data.origin}
            destination={data.destination}
            eta={data.eta}
            distance={data.distance}
            onViewDetails={handleViewDetails}
            isActionDisabled={!isSelected}
          />
        </div>
      </CardContent>
    </Card>
  );
}
