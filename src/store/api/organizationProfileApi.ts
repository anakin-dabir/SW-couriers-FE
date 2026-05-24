import { baseApi } from './baseApi';
import type { ApiResponse } from './types';

export interface ProfileCompletionItemDto {
  key: string;
  label: string;
  weight: number;
  completed: boolean;
}

export interface OrganizationProfileCompletionDto {
  percent_complete: number;
  items: ProfileCompletionItemDto[];
}

/** Pickup row from GET /organizations/{id}/profile */
export interface OrganizationPickupAddressDto {
  id: string;
  organization_id: string;
  label: string;
  line_1: string;
  line_2: string | null;
  /** UK region / county; maps to form `region` */
  state?: string | null;
  city: string;
  postcode: string;
  country: string;
  is_default: boolean;
  same_as_registered_address?: boolean;
  same_as_trading_address?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Organization object from GET profile (flat address fields on organization).
 * Extra keys from the API are allowed for forward compatibility.
 */
export interface OrganizationProfileOrganizationDto {
  id: string;
  reference?: string | null;
  trading_name: string | null;
  legal_entity_name: string | null;
  industry: string | null;
  company_size: string | null;
  date_of_incorporation: string | null;
  website: string | null;
  description: string | null;
  phone: string | null;
  companies_house_number: string | null;
  eori_number: string | null;
  vat_number: string | null;
  reg_address_line_1: string | null;
  reg_address_line_2: string | null;
  reg_city: string | null;
  reg_state: string | null;
  reg_postcode: string | null;
  reg_country: string | null;
  trading_address_line_1: string | null;
  trading_address_line_2: string | null;
  trading_address_city: string | null;
  trading_address_state: string | null;
  trading_address_postcode: string | null;
  trading_address_country: string | null;
  logo_url: string | null;
  version: number;
}

export interface OrganizationProfileDataDto {
  organization: OrganizationProfileOrganizationDto;
  pickup_addresses: OrganizationPickupAddressDto[];
}

export type OrganizationPickupAddressesDataDto =
  | OrganizationPickupAddressDto[]
  | { pickup_addresses: OrganizationPickupAddressDto[] };

/** Nested address in PATCH `payload` JSON */
export interface OrgProfileAddressPayload {
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string | null;
  postcode: string;
  country: string | null;
}

/** Pickup row inside PATCH `payload` JSON */
export interface OrgProfilePickupAddressPayload {
  id?: string;
  label: string;
  line_1: string;
  line_2: string | null;
  city: string;
  /** Aligns with registered/trading `state` in API payloads; form `region`. */
  state: string | null;
  postcode: string;
  country: string;
  is_default: boolean;
  same_as_registered_address: boolean;
  same_as_trading_address: boolean;
}

/** JSON stringified into multipart field `payload` (includes optimistic locking `version`). */
export interface OrgProfileSavePayload {
  version: number;
  trading_name: string | null;
  legal_entity_name: string | null;
  industry: string | null;
  company_size: string | null;
  date_of_incorporation: string | null;
  description: string | null;
  phone: string | null;
  website: string | null;
  companies_house_number: string | null;
  eori_number: string | null;
  vat_number: string | null;
  registered_address: OrgProfileAddressPayload | null;
  trading_same_as_registered_address: boolean;
  trading_address: OrgProfileAddressPayload | null;
  pickup_addresses: OrgProfilePickupAddressPayload[] | null;
}

export interface UpdateOrganizationProfileArgs {
  organizationId: string;
  payload: OrgProfileSavePayload;
  logo?: File | null;
  /** When true, omit a new file and ask the API to clear the stored logo (multipart hint). */
  removeLogo?: boolean;
}

export const organizationProfileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrganizationProfileCompletion: build.query<
      ApiResponse<OrganizationProfileCompletionDto>,
      { organizationId: string }
    >({
      query: ({ organizationId }) => ({
        url: `/organizations/${organizationId}/profile-completion`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { organizationId }) => [
        { type: 'OrganizationProfileCompletion', id: organizationId },
      ],
    }),
    getOrganizationProfile: build.query<
      ApiResponse<OrganizationProfileDataDto>,
      { organizationId: string }
    >({
      query: ({ organizationId }) => ({
        url: `/organizations/${organizationId}/profile`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { organizationId }) => [
        { type: 'OrganizationProfile', id: organizationId },
      ],
    }),
    getOrganizationPickupAddresses: build.query<
      ApiResponse<OrganizationPickupAddressesDataDto>,
      { organizationId: string }
    >({
      query: ({ organizationId }) => ({
        url: `/organizations/${organizationId}/pickup-addresses`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { organizationId }) => [
        { type: 'OrganizationProfile', id: organizationId },
        { type: 'OrganizationProfile', id: `${organizationId}:pickup-addresses` },
      ],
    }),
    updateOrganizationProfile: build.mutation<
      ApiResponse<OrganizationProfileDataDto>,
      UpdateOrganizationProfileArgs
    >({
      query: ({ organizationId, payload, logo, removeLogo }) => {
        const formData = new FormData();
        formData.append('payload', JSON.stringify(payload));
        if (logo && logo.size > 0) {
          formData.append('logo', logo);
        } else if (removeLogo) {
          formData.append('remove_logo', 'true');
        }
        return {
          url: `/organizations/${organizationId}/profile`,
          method: 'PATCH',
          body: formData,
        };
      },
      // Do not invalidate on error: refetch would overwrite the form with server data while the
      // user's failed edits should stay visible until they fix or discard.
      invalidatesTags: (_result, error, { organizationId }) => {
        if (error != null) {
          return [];
        }
        return [
          { type: 'OrganizationProfile', id: organizationId },
          { type: 'OrganizationProfileCompletion', id: organizationId },
        ];
      },
    }),
  }),
});

export const {
  useGetOrganizationProfileCompletionQuery,
  useGetOrganizationProfileQuery,
  useGetOrganizationPickupAddressesQuery,
  useUpdateOrganizationProfileMutation,
} = organizationProfileApi;
