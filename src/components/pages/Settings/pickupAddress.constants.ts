import type { PickupAddress } from '@/types/pickupAddress';
import type { SettingsPickupAddressFormData } from '@/schemas/pickup.schema';

export const EMPTY_PICKUP_ADDRESS: PickupAddress = {
  id: '',
  label: '',
  isDefault: false,
  contactFirstName: '',
  contactLastName: '',
  phoneNumber: '',
  buildingHouseNumber: '',
  firstLineOfAddress: '',
  secondLineOfAddress: '',
  townCity: '',
  county: '',
  postalCode: '',
  country: '',
};

export const defaultFormValues: SettingsPickupAddressFormData = {
  ...EMPTY_PICKUP_ADDRESS,
  country: 'United Kingdom',
  county: '',
  latitude: undefined,
  longitude: undefined,
};

export const MOCK_PICKUP_ADDRESSES: PickupAddress[] = [
  {
    id: '1',
    label: 'Pickup-1 ( Address Label )',
    isDefault: true,
    contactFirstName: 'John',
    contactLastName: 'Smith',
    phoneNumber: '+44 1234-678909',
    buildingHouseNumber: '123 or Rosewood House',
    firstLineOfAddress: 'Logistics Park, Old Kent Road',
    secondLineOfAddress: 'Unit 4B, Industrial Estate',
    townCity: 'London',
    county: 'Greater London',
    postalCode: 'SE1 5EU',
    country: 'United Kingdom',
  },
  {
    id: '2',
    label: 'Pickup-2 ( Address Label )',
    isDefault: false,
    contactFirstName: 'John',
    contactLastName: 'Smith',
    phoneNumber: '+44 1234-678909',
    buildingHouseNumber: '123 or Rosewood House',
    firstLineOfAddress: 'Logistics Park, Old Kent Road',
    secondLineOfAddress: 'Unit 4B, Industrial Estate',
    townCity: 'London',
    county: 'Greater London',
    postalCode: 'SE1 5EU',
    country: 'United Kingdom',
  },
];
