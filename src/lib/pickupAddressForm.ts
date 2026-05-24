import type { UseFormSetValue } from 'react-hook-form';
import type { PickupRequestFormData } from '@/schemas/pickup.schema';
import type { OrganizationPickupAddressDto } from '@/store/api/organizationProfileApi';

/** Legacy UI mock values — must never be sent as `pickup_address_id`. */
export const LEGACY_MOCK_PICKUP_ADDRESS_IDS = new Set([
  'default-depot',
  'london-hub',
  'manchester',
]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isPickupAddressUuid(value: string | undefined | null): boolean {
  if (!value?.trim()) return false;
  const trimmed = value.trim();
  if (LEGACY_MOCK_PICKUP_ADDRESS_IDS.has(trimmed)) return false;
  return UUID_RE.test(trimmed);
}

export function formatPickupAddressOptionLabel(address: OrganizationPickupAddressDto): string {
  const parts = [address.line_1, address.city, address.postcode].filter(Boolean);
  const line = parts.join(', ');
  return address.label?.trim() ? `${address.label} — ${line}` : line;
}

export function splitContactName(contactName: string): { first: string; second: string } {
  const parts = contactName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: 'Pickup', second: 'Contact' };
  if (parts.length === 1) return { first: parts[0] ?? 'Pickup', second: 'Contact' };
  return { first: parts[0] ?? 'Pickup', second: parts.slice(1).join(' ') };
}

export function applyOrganizationPickupAddressToForm(
  setValue: UseFormSetValue<PickupRequestFormData>,
  address: OrganizationPickupAddressDto,
  contactName = ''
): void {
  const opts = { shouldValidate: true as const };
  const { first, second } = splitContactName(contactName);

  setValue('pickupAddress.pickupInfo', address.id, opts);
  setValue('pickupAddress.addressLine', address.line_1, opts);
  setValue('pickupAddress.addressLine2', address.line_2 ?? '', opts);
  setValue('pickupAddress.city', address.city, opts);
  setValue('pickupAddress.state', address.state?.trim() || 'England', opts);
  setValue('pickupAddress.postalCode', address.postcode, opts);
  setValue('pickupAddress.country', address.country?.trim() || 'GB', opts);
  setValue('pickupAddress.personFirstName', first, opts);
  setValue('pickupAddress.personSecondName', second, opts);
}

export function resolvePickupAddressId(
  pickupAddress: PickupRequestFormData['pickupAddress']
): string | undefined {
  const candidate = pickupAddress.pickupInfo?.trim();
  if (!candidate || !isPickupAddressUuid(candidate)) return undefined;
  return candidate;
}
