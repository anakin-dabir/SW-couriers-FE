import * as React from 'react';
import { cn } from '@/lib/utils';
import DeliveryTrackingOverlay from './DeliveryTrackingOverlay';
import PathIndicatorMap from '@/components/organisms/maps/PathIndicatorMap';
import {
  DELIVERY_ROUTE_DESTINATION,
  DELIVERY_ROUTE_START,
  DELIVERY_TRUCK_POSITION,
} from '@/lib/data';
import type { LocationPoint } from '@/types/location';

interface DeliveryTrackingMapProps {
  /** Optional className */
  className?: string;
  /** Hide the overlay card */
  hideOverlay?: boolean;
  routeStart?: [number, number];
  routeDestination?: [number, number];
  routeCurrent?: [number, number];
  status?: string;
}

/**
 * DeliveryTrackingMap molecule component.
 * Displays a Leaflet map with route path, start, truck, and destination markers.
 * Used for delivery detail page to show the delivery route.
 * Matches Figma design 3838-22118.
 */
export default function DeliveryTrackingMap({
  className,
  hideOverlay = false,
  routeStart,
  routeDestination,
  routeCurrent,
  status,
}: DeliveryTrackingMapProps): React.JSX.Element {
  const IS_DELIVERED = React.useMemo(() => {
    return status?.toLowerCase() === 'delivered';
  }, [status]);

  const START: LocationPoint = React.useMemo(() => {
    const pos = routeStart ?? DELIVERY_ROUTE_START;
    return { id: 'start', latitude: pos[0], longitude: pos[1] };
  }, [routeStart]);

  const END: LocationPoint = React.useMemo(() => {
    const pos = routeDestination ?? DELIVERY_ROUTE_DESTINATION;
    return { id: 'destination', latitude: pos[0], longitude: pos[1] };
  }, [routeDestination]);

  const CURRENT: LocationPoint = React.useMemo(() => {
    const pos =
      routeCurrent ??
      (IS_DELIVERED ? (routeDestination ?? DELIVERY_ROUTE_DESTINATION) : DELIVERY_TRUCK_POSITION);
    return { id: 'truck', latitude: pos[0], longitude: pos[1] };
  }, [IS_DELIVERED, routeCurrent, routeDestination]);

  return (
    <div
      className={cn(
        'delivery-tracking-map-root relative h-full w-full overflow-hidden rounded-lg z-',
        className
      )}
    >
      <PathIndicatorMap
        start={START}
        end={END}
        current={CURRENT}
        traveledPathColor={IS_DELIVERED ? '#10b981' : '#CA0000'}
        remainingPathColor={IS_DELIVERED ? '#10b981' : '#EBC9C9'}
        showTruck={!IS_DELIVERED}
        markerColor={IS_DELIVERED ? '#10b981' : undefined}
        className="h-full w-full"
      />

      {!hideOverlay && <DeliveryTrackingOverlay />}

      <div className="absolute bottom-4 left-4 z-1000 rounded bg-white/90 px-2 py-1 text-xs text-gray-600">
        46,7 / 930 ml
      </div>
    </div>
  );
}
