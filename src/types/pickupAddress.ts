/**
 * Pickup address entity (display and form payload).
 * Used in Settings > Pickup Address list and drawer form.
 */
export interface PickupAddress {
  id: string;
  label: string;
  isDefault: boolean;
  contactFirstName: string;
  contactLastName: string;
  phoneNumber: string;
  buildingHouseNumber: string;
  firstLineOfAddress: string;
  secondLineOfAddress: string;
  townCity: string;
  county: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}
