import { baseApi } from './baseApi';
import type { ApiResponse } from './types';

export interface ServiceTier {
  id: string;
  tier_name: string;
  description: string | null;
  duration_days: number;
  error_margin_kg: number;
  price_per_kg: number;
  price_per_package: number;
  base_price: number;
  available_for: 'BOTH' | 'CUSTOMER_B2B' | 'CUSTOMER_B2C';
  scope_type: 'GLOBAL' | 'ORG';
  scope_org_id?: string | null;
  color: string;
  icon: string;
  status: 'ACTIVE' | 'INACTIVE';
  is_override?: boolean;
  source_scope_type?: 'GLOBAL' | 'ORG' | null;
  global_tier_id?: string | null;
  /** Populated only by effective-for-org; null on other tier endpoints. */
  permitted?: boolean | null;
  /** Populated only by effective-for-org; null on other tier endpoints. */
  is_default?: boolean | null;
  /** Populated only by effective-for-org: "standard" | "custom"; null elsewhere. */
  plain_type?: string | null;
  created_at: string;
  updated_at: string;
  version: number;
}

export type GetServiceTiersResponse = ApiResponse<{ items: ServiceTier[]; total: number }>;
export type GetServiceTierByIdResponse = ApiResponse<ServiceTier>;

export interface GetServiceTierByIdArg {
  tier_id: string;
}

export const serviceTiersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Returns the tiers (global + per-org overrides) the given org is permitted to use. */
    getEffectiveServiceTiersForOrg: builder.query<GetServiceTiersResponse, string>({
      query: (orgId) => ({
        url: `/service-tiers/effective-for-org/${orgId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, orgId) => [{ type: 'ServiceTier', id: `effective-${orgId}` }],
    }),
    getServiceTierById: builder.query<GetServiceTierByIdResponse, GetServiceTierByIdArg>({
      query: ({ tier_id }) => ({
        url: `/service-tiers/${tier_id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { tier_id }) => [{ type: 'ServiceTier', id: tier_id }],
    }),
  }),
});

export const {
  useGetEffectiveServiceTiersForOrgQuery,
  useLazyGetEffectiveServiceTiersForOrgQuery,
  useGetServiceTierByIdQuery,
  useLazyGetServiceTierByIdQuery,
} = serviceTiersApi;
