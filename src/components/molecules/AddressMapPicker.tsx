'use client';

import L from 'leaflet';
import { useState } from 'react';
import type React from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { MarkerIcon, MarkerIcon2x, MarkerShadow } from '@/assets/img';
import { cn } from '@/lib/utils';

const markerPinIcon = L.icon({
  iconRetinaUrl: MarkerIcon2x,
  iconUrl: MarkerIcon,
  shadowUrl: MarkerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_MAP_CENTER: [number, number] = [51.5074, -0.1278];

interface NominatimResponse {
  display_name?: string;
  address?: Record<string, string | undefined>;
}

export interface MapPickedAddress {
  line1: string;
  line2: string;
  country: string;
  region: string;
  city: string;
  postcode: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

interface MapClickHandlerProps {
  onLocationPick: (position: [number, number]) => void;
}

function MapClickHandler({ onLocationPick }: MapClickHandlerProps): null {
  useMapEvents({
    click(event) {
      onLocationPick([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

export interface AddressMapPickerProps {
  onApplyAddress: (address: MapPickedAddress) => void;
  onClose: () => void;
  initialCenter?: [number, number];
  title?: string;
  applyButtonLabel?: string;
  className?: string;
}

export default function AddressMapPicker({
  onApplyAddress,
  onClose,
  initialCenter = DEFAULT_MAP_CENTER,
  title = 'Pick Address From Map',
  applyButtonLabel = 'Use This Address',
  className,
}: AddressMapPickerProps): React.JSX.Element {
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(initialCenter);
  const [selectedAddress, setSelectedAddress] = useState<MapPickedAddress | null>(null);
  const [isResolvingAddress, setIsResolvingAddress] = useState<boolean>(false);
  const [resolutionError, setResolutionError] = useState<string>('');

  const resolveAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ): Promise<void> => {
    setIsResolvingAddress(true);
    setResolutionError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`,
        {
          headers: { 'Accept-Language': 'en-GB' },
        }
      );

      if (!response.ok) {
        throw new Error('Unable to resolve address');
      }

      const data = (await response.json()) as NominatimResponse;
      const address = data.address ?? {};
      const houseNumber = address.house_number ?? '';
      const road = address.road ?? address.pedestrian ?? address.footway ?? '';
      const line1Fallback = data.display_name?.split(',')[0]?.trim() ?? '';
      const line1 = [houseNumber, road].filter(Boolean).join(' ').trim() || line1Fallback;

      setSelectedAddress({
        line1,
        line2: address.suburb ?? address.neighbourhood ?? '',
        country: address.country ?? 'United Kingdom',
        region: address.state ?? address.county ?? address.state_district ?? address.region ?? '',
        city: address.city ?? address.town ?? address.village ?? address.hamlet ?? '',
        postcode: address.postcode ?? '',
        latitude,
        longitude,
        displayName: data.display_name ?? '',
      });
    } catch {
      setSelectedAddress(null);
      setResolutionError('Could not fetch address details for this point. Please try another pin.');
    } finally {
      setIsResolvingAddress(false);
    }
  };

  const handlePositionSelect = (position: [number, number]): void => {
    setMarkerPosition(position);
    void resolveAddressFromCoordinates(position[0], position[1]);
  };

  return (
    <div className={cn('mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3', className)}>
      <div className="mb-2 flex items-center justify-between">
        <Typography
          component="span"
          className="text-xs font-semibold uppercase tracking-wide text-gray-700"
        >
          {title}
        </Typography>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={onClose}
        >
          Close
        </Button>
      </div>

      <div className="h-64 overflow-hidden rounded-lg border border-gray-200">
        <MapContainer center={markerPosition} zoom={13} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationPick={handlePositionSelect} />
          <Marker
            position={markerPosition}
            icon={markerPinIcon}
            draggable
            eventHandlers={{
              dragend: (event) => {
                const marker = event.target as L.Marker;
                const latLng = marker.getLatLng();
                handlePositionSelect([latLng.lat, latLng.lng]);
              },
            }}
          />
        </MapContainer>
      </div>

      <Typography component="span" className="mt-2 block text-xs text-gray-500">
        Click on the map or drag the pin to choose a location.
      </Typography>

      {isResolvingAddress && (
        <Typography component="span" className="mt-2 block text-xs text-gray-700">
          Resolving address...
        </Typography>
      )}
      {resolutionError && (
        <Typography component="span" className="mt-2 block text-xs text-red-600">
          {resolutionError}
        </Typography>
      )}

      {selectedAddress && !isResolvingAddress && (
        <div className="mt-3 rounded-md border border-gray-200 bg-white p-3">
          <Typography component="span" className="text-xs font-medium text-gray-900">
            {selectedAddress.line1 || 'Address line not available'}
          </Typography>
          <Typography component="span" className="mt-1 block text-xs text-gray-500">
            {[selectedAddress.city, selectedAddress.region, selectedAddress.postcode]
              .filter(Boolean)
              .join(', ') || 'City/region/postcode unavailable'}
          </Typography>
          <div className="mt-3">
            <Button
              type="button"
              size="sm"
              className="h-8"
              onClick={() => onApplyAddress(selectedAddress)}
            >
              {applyButtonLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
