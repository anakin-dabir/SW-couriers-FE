import type { AddressFields, GeneralSettingsState } from './types';

export const INDUSTRY_OPTIONS = [
  { value: 'ECOMMERCE', label: 'E-commerce' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'WHOLESALE_DISTRIBUTION', label: 'Wholesale & Distribution' },
  { value: 'LOGISTICS_TRANSPORT', label: 'Logistics & Transport' },
  { value: 'TECHNOLOGY_SOFTWARE', label: 'Technology & Software' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const COMPANY_SIZE_OPTIONS = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '500+ employees',
] as const;

export const UK_REGIONS = ['England', 'Scotland', 'Wales', 'Northern Ireland'] as const;

export const REGION_CITY_MAP: Record<(typeof UK_REGIONS)[number], string[]> = {
  England: ['London', 'Manchester', 'Birmingham', 'Leeds'],
  Scotland: ['Glasgow', 'Edinburgh', 'Aberdeen', 'Dundee'],
  Wales: ['Cardiff', 'Swansea', 'Newport'],
  'Northern Ireland': ['Belfast', 'Lisburn', 'Derry'],
};

export const EMPTY_ADDRESS: AddressFields = {
  line1: '',
  line2: '',
  country: 'United Kingdom',
  region: '',
  city: '',
  postcode: '',
};

export const INITIAL_GENERAL_SETTINGS: GeneralSettingsState = {
  tradingName: '',
  legalEntityName: '',
  industry: '',
  companySize: '',
  dateOfIncorporation: '',
  website: '',
  businessDescription: '',
  phone: '',
  companiesHouseNumber: '',
  eoriNumber: '',
  vatNumber: '',
  registeredAddress: { ...EMPTY_ADDRESS },
  registeredLatitude: null,
  registeredLongitude: null,
  tradingAddressSameAsRegistered: false,
  tradingAddress: { ...EMPTY_ADDRESS },
  tradingLatitude: null,
  tradingLongitude: null,
  pickupAddresses: [
    {
      id: 'pickup-1',
      isDefault: true,
      sameAsRegistered: false,
      sameAsTrading: false,
      latitude: null,
      longitude: null,
      ...EMPTY_ADDRESS,
    },
  ],
};
