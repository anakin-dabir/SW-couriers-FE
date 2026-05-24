import * as React from 'react';
import MarkerMap from '@/components/organisms/maps/MarkerMap';
import PathIndicatorMap from '@/components/organisms/maps/PathIndicatorMap';
import { cn } from '@/lib/utils';
import type { TrackingDeliveryCardData } from '@/types/delivery';
import type { LocationPoint } from '@/types/location';

interface TrackingDeliveryMapTogglerProps {
  /** Selected card; when undefined we show MarkerMap with all locations */
  selectedCard?: TrackingDeliveryCardData;
  /** All locations to render in MarkerMap (initial state) */
  allLocations: LocationPoint[];
  /** Handler when a marker is clicked (sets selected id) */
  onMarkerClick: (id: string) => void;
  /** Optional wrapper className */
  className?: string;
}

/**
 * TrackingDeliveryMapToggler molecule.
 * - No selection: shows MarkerMap with all card locations
 * - Selected: shows PathIndicatorMap (route)
 * - Delivered: no truck marker + green path + green markers
 */
export default function TrackingDeliveryMapToggler({
  selectedCard,
  allLocations,
  onMarkerClick,
  className,
}: TrackingDeliveryMapTogglerProps): React.JSX.Element {
  const IS_DELIVERED = React.useMemo(() => {
    return selectedCard?.status.toLowerCase() === 'delivered';
  }, [selectedCard]);

  const PATH_START = React.useMemo((): LocationPoint | null => {
    if (!selectedCard) return null;
    return {
      id: 'start',
      latitude: selectedCard.routeStart[0],
      longitude: selectedCard.routeStart[1],
    };
  }, [selectedCard]);

  const PATH_END = React.useMemo((): LocationPoint | null => {
    if (!selectedCard) return null;
    return {
      id: 'destination',
      latitude: selectedCard.routeDestination[0],
      longitude: selectedCard.routeDestination[1],
    };
  }, [selectedCard]);

  const PATH_CURRENT = React.useMemo((): LocationPoint | null => {
    if (!selectedCard) return null;
    const position = selectedCard.routeCurrent ?? selectedCard.routeDestination;
    return { id: 'truck', latitude: position[0], longitude: position[1] };
  }, [selectedCard]);

  const PATH_CONFIG = React.useMemo(() => {
    if (!PATH_START || !PATH_END || !PATH_CURRENT) return null;
    return {
      start: PATH_START,
      end: PATH_END,
      current: PATH_CURRENT,
      traveledPathColor: IS_DELIVERED ? '#10b981' : '#CA0000',
      remainingPathColor: IS_DELIVERED ? '#10b981' : '#EBC9C9',
      showTruck: !IS_DELIVERED,
      markerColor: IS_DELIVERED ? '#10b981' : undefined,
      className: 'delivery-tracking-map-root w-full h-full',
    };
  }, [IS_DELIVERED, PATH_CURRENT, PATH_END, PATH_START]);

  const MARKER_MAP_CONFIG = React.useMemo(() => {
    return {
      activeLocations: [] as LocationPoint[],
      inactiveLocations: allLocations,
      selectedLocationId: undefined,
      onMarkerClick,
      className: 'w-full h-full',
    };
  }, [allLocations, onMarkerClick]);

  return (
    <div
      className={cn(
        'sticky top-0 min-h-map-mobile h-(--min-height-map-mobile) lg:h-[calc(100vh-6.875rem)]',
        className
      )}
    >
      {PATH_CONFIG ? <PathIndicatorMap {...PATH_CONFIG} /> : <MarkerMap {...MARKER_MAP_CONFIG} />}
    </div>
  );
}
