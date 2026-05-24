import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/molecules/card';
import { FormSelect } from '@/components/molecules';
import DashboardCardHeader from './DashboardCardHeader';
import DashboardMap from './DashboardMap';
import {
  MOCK_DELIVERY_TRACKING_LOCATIONS,
  DELIVERY_TRACKING_TITLE,
  PENDING_PICKUP_OPTIONS,
  DELIVERY_ROUTE_PATH,
} from '@/lib/data';
import { cn } from '@/lib/utils';

interface DeliveryTrackingCardProps {
  /** Optional className */
  className?: string;
}

/**
 * DeliveryTrackingCard molecule component.
 * Displays a map with delivery location markers.
 * Matches the structure of DashboardOverviewStats and Figma design 3838-22118.
 */
export default function DeliveryTrackingCard({
  className,
}: DeliveryTrackingCardProps): React.JSX.Element {
  const [selectedFilter, setSelectedFilter] = React.useState<string>('pending-pickup');

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedFilter(event.target.value);
  };

  const headerActions = (
    <div className="flex flex-col gap-2">
      <FormSelect
        options={PENDING_PICKUP_OPTIONS}
        value={selectedFilter}
        onChange={handleFilterChange}
        className="w-32"
        wrapperClassName="flex flex-row items-center"
      />
    </div>
  );

  return (
    <Card className={cn('flex h-full flex-col', className)}>
      <CardHeader className="pb-4">
        <DashboardCardHeader title={DELIVERY_TRACKING_TITLE} actions={headerActions} />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        <div className="flex h-full w-full flex-1 min-h-map-mobile md:min-h-none">
          <DashboardMap
            locations={MOCK_DELIVERY_TRACKING_LOCATIONS}
            routePath={DELIVERY_ROUTE_PATH}
            className="h-full w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
