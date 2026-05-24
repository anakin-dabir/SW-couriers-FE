import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { Typography, InfoBlock, DestinationMarker, CardActionButton } from '@/components/atoms';
import { WarehouseIcon } from '@/assets/img';
import { cn } from '@/lib/utils';

interface PickupCardMetaSectionProps {
  origin: string;
  destination: string;
  eta: string;
  distance: string;
  onViewDetails?: () => void;
  isActionDisabled?: boolean;
  className?: string;
}

export default function PickupCardMetaSection({
  origin,
  destination,
  eta,
  distance,
  onViewDetails,
  isActionDisabled = false,
  className,
}: PickupCardMetaSectionProps): React.JSX.Element {
  const VIEW_DETAILS_ICON = <ArrowRight className="h-4 w-4" />;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center gap-2">
        <img src={WarehouseIcon} alt="Warehouse" className="h-5 w-5 object-contain" />
        <Typography variant="body" className="text-base text-gray-900">
          {origin}
        </Typography>
        <ArrowRight className="h-4 w-4 text-gray-900" />
        <DestinationMarker />
        <Typography variant="body" className="text-base text-gray-700">
          {destination}
        </Typography>
      </div>

      <div className="flex items-start justify-between">
        <InfoBlock label="ETA" value={eta} align="left" />
        <InfoBlock label="Distance" value={distance} align="right" />
      </div>

      <CardActionButton
        onClick={onViewDetails}
        disabled={isActionDisabled}
        rightIcon={VIEW_DETAILS_ICON}
      >
        View Details
      </CardActionButton>
    </div>
  );
}
