import type { MapPickedAddress } from '@/components/molecules/AddressMapPicker';

export interface AddressFields {
  line1: string;
  line2: string;
  country: string;
  region: string;
  city: string;
  postcode: string;
}

export type PickupAddress = AddressFields & {
  id: string;
  /** From API when editing existing pickup rows */
  label?: string;
  isDefault: boolean;
  sameAsRegistered: boolean;
  sameAsTrading: boolean;
  latitude: number | null;
  longitude: number | null;
};

export interface GeneralSettingsState {
  tradingName: string;
  legalEntityName: string;
  industry: string;
  companySize: string;
  dateOfIncorporation: string;
  website: string;
  businessDescription: string;
  phone: string;
  companiesHouseNumber: string;
  eoriNumber: string;
  vatNumber: string;
  registeredAddress: AddressFields;
  registeredLatitude: number | null;
  registeredLongitude: number | null;
  tradingAddressSameAsRegistered: boolean;
  tradingAddress: AddressFields;
  tradingLatitude: number | null;
  tradingLongitude: number | null;
  pickupAddresses: PickupAddress[];
}

export type MapPickerTarget = 'registered' | 'trading' | `pickup:${string}`;

export type UpdateGeneralSettings = <K extends keyof GeneralSettingsState>(
  key: K,
  value: GeneralSettingsState[K]
) => void;

export type ApplyAddressFromMap = (target: MapPickerTarget, address: MapPickedAddress) => void;
