import type {
  AddressFields,
  GeneralSettingsState,
  PickupAddress,
} from '@/components/pages/Settings/CompanyDetails/types';
import type {
  OrganizationProfileDataDto,
  OrgProfileAddressPayload,
  OrgProfilePickupAddressPayload,
  OrgProfileSavePayload,
} from '@/store/api/organizationProfileApi';

function nullToString(value: string | null | undefined): string {
  return value ?? '';
}

function mapRegisteredAddress(org: OrganizationProfileDataDto['organization']): AddressFields {
  return {
    line1: nullToString(org.reg_address_line_1),
    line2: nullToString(org.reg_address_line_2),
    country: nullToString(org.reg_country) || 'United Kingdom',
    region: nullToString(org.reg_state),
    city: nullToString(org.reg_city),
    postcode: nullToString(org.reg_postcode),
  };
}

function isTradingAddressEmpty(org: OrganizationProfileDataDto['organization']): boolean {
  const parts = [
    org.trading_address_line_1,
    org.trading_address_line_2,
    org.trading_address_city,
    org.trading_address_state,
    org.trading_address_postcode,
    org.trading_address_country,
  ];
  return parts.every((p) => p == null || String(p).trim() === '');
}

function mapTradingAddressFromApi(org: OrganizationProfileDataDto['organization']): AddressFields {
  return {
    line1: nullToString(org.trading_address_line_1),
    line2: nullToString(org.trading_address_line_2),
    country: nullToString(org.trading_address_country) || 'United Kingdom',
    region: nullToString(org.trading_address_state),
    city: nullToString(org.trading_address_city),
    postcode: nullToString(org.trading_address_postcode),
  };
}

function mapPickupAddresses(
  items: OrganizationProfileDataDto['pickup_addresses']
): PickupAddress[] {
  return items.map((row) => ({
    id: row.id,
    label: row.label,
    line1: nullToString(row.line_1),
    line2: nullToString(row.line_2),
    country: nullToString(row.country) || 'United Kingdom',
    region: nullToString(row.state),
    city: nullToString(row.city),
    postcode: nullToString(row.postcode),
    isDefault: row.is_default,
    sameAsRegistered: row.same_as_registered_address ?? false,
    sameAsTrading: row.same_as_trading_address ?? false,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
  }));
}

export interface MappedOrganizationProfile {
  generalSettings: GeneralSettingsState;
  profileVersion: number;
  logoUrl: string | null;
}

export function mapOrganizationProfileDataToFormState(
  data: OrganizationProfileDataDto
): MappedOrganizationProfile {
  const org = data.organization;
  const registeredAddress = mapRegisteredAddress(org);
  const tradingEmpty = isTradingAddressEmpty(org);
  const tradingAddress = tradingEmpty ? { ...registeredAddress } : mapTradingAddressFromApi(org);

  const generalSettings: GeneralSettingsState = {
    tradingName: nullToString(org.trading_name),
    legalEntityName: nullToString(org.legal_entity_name),
    industry: nullToString(org.industry),
    companySize: nullToString(org.company_size),
    dateOfIncorporation: nullToString(org.date_of_incorporation),
    website: nullToString(org.website),
    businessDescription: nullToString(org.description),
    phone: nullToString(org.phone),
    companiesHouseNumber: nullToString(org.companies_house_number),
    eoriNumber: nullToString(org.eori_number),
    vatNumber: nullToString(org.vat_number),
    registeredAddress,
    registeredLatitude: null,
    registeredLongitude: null,
    tradingAddressSameAsRegistered: tradingEmpty,
    tradingAddress,
    tradingLatitude: null,
    tradingLongitude: null,
    pickupAddresses:
      data.pickup_addresses.length > 0 ? mapPickupAddresses(data.pickup_addresses) : [],
  };

  return {
    generalSettings,
    profileVersion: org.version,
    logoUrl: org.logo_url,
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function cloneGeneralSettingsState(settings: GeneralSettingsState): GeneralSettingsState {
  return JSON.parse(JSON.stringify(settings)) as GeneralSettingsState;
}

function emptyToNull(value: string): string | null {
  const t = value.trim();
  return t === '' ? null : t;
}

function mapAddressToOrgPayload(address: AddressFields): OrgProfileAddressPayload {
  return {
    address_line_1: address.line1.trim(),
    address_line_2: address.line2.trim() === '' ? null : address.line2.trim(),
    city: address.city.trim(),
    state: address.region.trim() === '' ? null : address.region.trim(),
    postcode: address.postcode.trim(),
    country: address.country.trim() === '' ? null : address.country.trim(),
  };
}

/** Trading address payload: `country` is required (defaults to United Kingdom). */
function mapTradingAddressToOrgPayload(address: AddressFields): OrgProfileAddressPayload {
  const base = mapAddressToOrgPayload(address);
  return {
    ...base,
    country: base.country ?? 'United Kingdom',
  };
}

function effectivePickupAddressForPayload(
  pickup: PickupAddress,
  registeredAddress: AddressFields,
  effectiveTradingAddress: AddressFields
): AddressFields {
  if (pickup.sameAsRegistered) {
    return registeredAddress;
  }
  if (pickup.sameAsTrading) {
    return effectiveTradingAddress;
  }
  return pickup;
}

function mapPickupToOrgPayload(
  pickup: PickupAddress,
  index: number,
  linesSource: AddressFields
): OrgProfilePickupAddressPayload {
  const labelTrimmed = pickup.label?.trim() ?? '';
  const line1Trimmed = linesSource.line1.trim();
  const label =
    labelTrimmed !== ''
      ? labelTrimmed
      : line1Trimmed !== ''
        ? line1Trimmed
        : `Pickup ${String(index + 1).padStart(2, '0')}`;

  const row: OrgProfilePickupAddressPayload = {
    label,
    line_1: linesSource.line1.trim(),
    line_2: linesSource.line2.trim() === '' ? null : linesSource.line2.trim(),
    city: linesSource.city.trim(),
    state: linesSource.region.trim() === '' ? null : linesSource.region.trim(),
    postcode: linesSource.postcode.trim(),
    country: linesSource.country.trim() === '' ? 'United Kingdom' : linesSource.country.trim(),
    is_default: pickup.isDefault,
    same_as_registered_address: pickup.sameAsRegistered,
    same_as_trading_address: pickup.sameAsTrading,
  };

  if (UUID_REGEX.test(pickup.id)) {
    return { ...row, id: pickup.id };
  }

  return row;
}

export function mapGeneralSettingsToOrgProfileSavePayload(
  state: GeneralSettingsState,
  version: number
): OrgProfileSavePayload {
  const registered_address = mapAddressToOrgPayload(state.registeredAddress);
  const trading_same = state.tradingAddressSameAsRegistered;
  const trading_address = trading_same ? null : mapTradingAddressToOrgPayload(state.tradingAddress);

  const effectiveTradingForPickups = trading_same ? state.registeredAddress : state.tradingAddress;

  const pickup_addresses =
    state.pickupAddresses.length === 0
      ? null
      : state.pickupAddresses.map((p, i) =>
          mapPickupToOrgPayload(
            p,
            i,
            effectivePickupAddressForPayload(p, state.registeredAddress, effectiveTradingForPickups)
          )
        );

  return {
    version,
    trading_name: emptyToNull(state.tradingName),
    legal_entity_name: emptyToNull(state.legalEntityName),
    industry: emptyToNull(state.industry),
    company_size: emptyToNull(state.companySize),
    date_of_incorporation: emptyToNull(state.dateOfIncorporation),
    description: emptyToNull(state.businessDescription),
    phone: emptyToNull(state.phone),
    website: emptyToNull(state.website),
    companies_house_number: emptyToNull(state.companiesHouseNumber),
    eori_number: emptyToNull(state.eoriNumber),
    vat_number: emptyToNull(state.vatNumber),
    registered_address,
    trading_same_as_registered_address: trading_same,
    trading_address,
    pickup_addresses,
  };
}
