import * as React from 'react';
import { MapContainer, Marker, TileLayer, ZoomControl, Polyline } from 'react-leaflet';
import {
  cn,
  createDestinationMarkerIcon,
  createStartMarkerIcon,
  createTruckMarkerIcon,
} from '@/lib/utils';
import type { LocationPoint } from '@/types/location';

import 'leaflet/dist/leaflet.css';

interface PathIndicatorMapProps {
  start: LocationPoint;
  end: LocationPoint;
  current: LocationPoint;
  traveledPathColor: string;
  remainingPathColor: string;
  /** When false (e.g. delivered), truck marker is hidden */
  showTruck?: boolean;
  /** Optional marker color for start/destination (e.g. green when delivered) */
  markerColor?: string;
  className?: string;
}

const DEFAULT_ZOOM = 13;

const DEFAULT_MARKER_COLOR = '#CA0000';

export default function PathIndicatorMap({
  start,
  end,
  current,
  traveledPathColor,
  remainingPathColor,
  showTruck = true,
  markerColor = DEFAULT_MARKER_COLOR,
  className,
}: PathIndicatorMapProps): React.JSX.Element {
  const center = React.useMemo((): [number, number] => {
    const avgLat = (start.latitude + end.latitude + current.latitude) / 3;
    const avgLng = (start.longitude + end.longitude + current.longitude) / 3;
    return [avgLat, avgLng];
  }, [start, end, current]);

  const traveledPath = React.useMemo((): Array<[number, number]> => {
    return [
      [start.latitude, start.longitude],
      [current.latitude, current.longitude],
    ];
  }, [start, current]);

  const remainingPath = React.useMemo((): Array<[number, number]> => {
    return [
      [current.latitude, current.longitude],
      [end.latitude, end.longitude],
    ];
  }, [current, end]);

  return (
    <div className={cn('relative h-full w-full overflow-hidden rounded-lg', className)}>
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full z-10"
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />

        {traveledPath.length > 1 && (
          <Polyline
            positions={traveledPath}
            pathOptions={{
              color: traveledPathColor,
              weight: 4,
              opacity: 1,
            }}
          />
        )}
        {remainingPath.length > 1 && (
          <Polyline
            positions={remainingPath}
            pathOptions={{
              color: remainingPathColor,
              weight: 4,
              opacity: 1,
            }}
          />
        )}

        <Marker
          position={[start.latitude, start.longitude]}
          icon={createStartMarkerIcon(markerColor)}
        />
        {showTruck && (
          <Marker position={[current.latitude, current.longitude]} icon={createTruckMarkerIcon()} />
        )}
        <Marker
          position={[end.latitude, end.longitude]}
          icon={createDestinationMarkerIcon(markerColor)}
        />
      </MapContainer>
    </div>
  );
}
