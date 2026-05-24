import type { AddressFields } from './types';

export const DEFAULT_MAP_CENTER: [number, number] = [51.5074, -0.1278];

interface NominatimSearchResult {
  lat: string;
  lon: string;
}

function isValidCoordinate(value: number | null | undefined): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function buildGeocodeQueryFromAddress(address: AddressFields): string {
  const parts = [
    address.line1?.trim(),
    address.city?.trim(),
    address.postcode?.trim(),
    address.country?.trim() || 'United Kingdom',
  ].filter(Boolean);

  return parts.join(', ');
}

export function resolveSyncMapCenterFromCoords(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): [number, number] | null {
  if (isValidCoordinate(latitude) && isValidCoordinate(longitude)) {
    return [latitude, longitude];
  }
  return null;
}

export async function geocodeAddressLineToMapCenter(
  address: AddressFields
): Promise<[number, number] | null> {
  const query = buildGeocodeQueryFromAddress(address);
  if (!address.line1?.trim()) {
    return null;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&countrycodes=gb&limit=1`,
      {
        headers: { 'Accept-Language': 'en-GB' },
      }
    );

    if (!response.ok) {
      return null;
    }

    const results = (await response.json()) as NominatimSearchResult[];
    const first = results[0];
    if (!first) {
      return null;
    }

    const lat = Number.parseFloat(first.lat);
    const lon = Number.parseFloat(first.lon);
    if (!isValidCoordinate(lat) || !isValidCoordinate(lon)) {
      return null;
    }

    return [lat, lon];
  } catch {
    return null;
  }
}

export async function resolveMapInitialCenter(
  address: AddressFields,
  latitude: number | null | undefined,
  longitude: number | null | undefined
): Promise<[number, number]> {
  const fromCoords = resolveSyncMapCenterFromCoords(latitude, longitude);
  if (fromCoords) {
    return fromCoords;
  }

  const fromAddress = await geocodeAddressLineToMapCenter(address);
  return fromAddress ?? DEFAULT_MAP_CENTER;
}
