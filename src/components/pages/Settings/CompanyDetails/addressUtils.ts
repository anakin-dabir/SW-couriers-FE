import type { AddressFields } from './types';
import { REGION_CITY_MAP, UK_REGIONS } from './constants';

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveRegion(rawRegion: string): string {
  const normalizedRawRegion = normalizeValue(rawRegion);
  if (!normalizedRawRegion) return '';

  const exactMatch = UK_REGIONS.find((region) => normalizeValue(region) === normalizedRawRegion);
  if (exactMatch) return exactMatch;

  const fuzzyMatch = UK_REGIONS.find(
    (region) =>
      normalizedRawRegion.includes(normalizeValue(region)) ||
      normalizeValue(region).includes(normalizedRawRegion)
  );

  return fuzzyMatch ?? '';
}

export function resolveCity(region: string, rawCity: string): string {
  const normalizedRawCity = normalizeValue(rawCity);
  if (!region || !normalizedRawCity) return '';

  const cityOptions = REGION_CITY_MAP[region as keyof typeof REGION_CITY_MAP] ?? [];
  const exactMatch = cityOptions.find((city) => normalizeValue(city) === normalizedRawCity);
  if (exactMatch) return exactMatch;

  const fuzzyMatch = cityOptions.find(
    (city) =>
      normalizedRawCity.includes(normalizeValue(city)) ||
      normalizeValue(city).includes(normalizedRawCity)
  );

  return fuzzyMatch ?? '';
}

export function mergeAddress(
  currentAddress: AddressFields,
  nextAddress: Partial<AddressFields>
): AddressFields {
  return {
    line1: nextAddress.line1?.trim() ? nextAddress.line1 : currentAddress.line1,
    line2: nextAddress.line2 !== undefined ? nextAddress.line2 : currentAddress.line2,
    country: 'United Kingdom',
    region: nextAddress.region?.trim() ? nextAddress.region : currentAddress.region,
    city: nextAddress.city?.trim() ? nextAddress.city : currentAddress.city,
    postcode: nextAddress.postcode?.trim() ? nextAddress.postcode : currentAddress.postcode,
  };
}
