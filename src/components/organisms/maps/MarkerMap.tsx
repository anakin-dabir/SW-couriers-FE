import * as React from 'react';
import { MapContainer, Marker, TileLayer, ZoomControl } from 'react-leaflet';
import { cn, createMarkerIcon, createTruckBwMarkerIcon } from '@/lib/utils';
import type { LocationPoint } from '@/types/location';

import 'leaflet/dist/leaflet.css';

interface MarkerMapProps {
  activeLocations: LocationPoint[];
  inactiveLocations: LocationPoint[];
  selectedLocationId?: string;
  onMarkerClick?: (id: string) => void;
  /** Optional truck positions to display with black and white truck icons */
  truckPositions?: LocationPoint[];
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [52.4862, -1.8904];
const DEFAULT_ZOOM = 13;

export default function MarkerMap({
  activeLocations,
  inactiveLocations,
  selectedLocationId,
  onMarkerClick,
  truckPositions,
  className,
}: MarkerMapProps): React.JSX.Element {
  const allLocations = React.useMemo(() => {
    return [...activeLocations, ...inactiveLocations];
  }, [activeLocations, inactiveLocations]);

  const center = React.useMemo((): [number, number] => {
    if (allLocations.length === 0) return DEFAULT_CENTER;
    const avgLat = allLocations.reduce((sum, loc) => sum + loc.latitude, 0) / allLocations.length;
    const avgLng = allLocations.reduce((sum, loc) => sum + loc.longitude, 0) / allLocations.length;
    return [avgLat, avgLng];
  }, [allLocations]);

  const ACTIVE_ID_SET = React.useMemo(() => {
    return new Set(activeLocations.map((l) => l.id));
  }, [activeLocations]);

  return (
    <div
      className={cn(
        'dashboard-map-root relative h-full w-full overflow-hidden rounded-lg',
        className
      )}
    >
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />

        {allLocations.map((location) => {
          const isActiveByData = ACTIVE_ID_SET.has(location.id);
          const isSelected = selectedLocationId === location.id;
          const isActive = isSelected || isActiveByData;

          return (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={createMarkerIcon(isActive, location.id)}
              eventHandlers={
                onMarkerClick
                  ? {
                      click: () => {
                        onMarkerClick(location.id);
                      },
                    }
                  : undefined
              }
            />
          );
        })}

        {truckPositions?.map((truck) => (
          <Marker
            key={`truck-${truck.id}`}
            position={[truck.latitude, truck.longitude]}
            icon={createTruckBwMarkerIcon()}
          />
        ))}
      </MapContainer>
    </div>
  );
}
