import { baseApi } from '@/store/api/baseApi';

interface BraintreeClientTokenApiResponse {
  success: true;
  data: {
    client_token: string;
  };
}

function parseBraintreeClientToken(raw: unknown): { clientToken: string } {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid client token response');
  }
  const o = raw as Partial<BraintreeClientTokenApiResponse>;
  if (o.success !== true) {
    throw new Error('Invalid client token response: success is not true');
  }
  const token = o.data?.client_token;
  if (typeof token !== 'string' || token.length === 0) {
    throw new Error('Invalid client token response: missing data.client_token');
  }
  return { clientToken: token };
}

interface CardPaymentNonceApiResponse {
  success: true;
  data: {
    nonce: string;
    bin: string;
  };
}

function parseCardPaymentNonce(raw: unknown): { nonce: string; bin: string } {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid payment nonce response');
  }
  const o = raw as Partial<CardPaymentNonceApiResponse>;
  if (o.success !== true) {
    throw new Error('Invalid payment nonce response: success is not true');
  }
  if (!o.data || typeof o.data !== 'object') {
    throw new Error('Invalid payment nonce response: missing data');
  }
  const nonce = o.data.nonce;
  if (typeof nonce !== 'string' || nonce.length === 0) {
    throw new Error('Invalid payment nonce response: missing data.nonce');
  }
  const bin = o.data.bin;
  if (typeof bin !== 'string' || bin.length < 6) {
    throw new Error('Invalid payment nonce response: missing or invalid data.bin');
  }
  return { nonce, bin };
}

export interface RequestCardPaymentNonceArgs {
  organizationId: string;
  cardId: string;
}

export interface SetCardDefaultArgs {
  organizationId: string;
  cardId: string;
}

export interface SaveOrganizationCardRequest {
  organizationId: string;
  nonce: string;
  cardholder_name: string;
  set_as_default?: boolean;
}

/** Saved card row from GET .../payment-methods/cards */
export interface PaymentMethodResponse {
  id: string;
  card_type: string | null;
  last_four: string | null;
  expiry_month: number | null;
  expiry_year: number | null;
  cardholder_name: string | null;
  is_default: boolean;
  status: string;
  created_at: string;
}

interface SavedCardsListApiResponse {
  success: true;
  message?: string | null;
  data: PaymentMethodResponse[];
}

function parseSavedCardsResponse(raw: unknown): PaymentMethodResponse[] {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid saved cards response');
  }
  const o = raw as Partial<SavedCardsListApiResponse>;
  if (o.success !== true) {
    throw new Error('Invalid saved cards response: success is not true');
  }
  if (!Array.isArray(o.data)) {
    throw new Error('Invalid saved cards response: data is not an array');
  }
  return o.data.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`Invalid saved cards response: data[${index}] is not an object`);
    }
    const row = item as Partial<PaymentMethodResponse>;
    if (typeof row.id !== 'string' || row.id.length === 0) {
      throw new Error(`Invalid saved cards response: data[${index}].id`);
    }
    return {
      id: row.id,
      card_type: row.card_type ?? null,
      last_four: row.last_four ?? null,
      expiry_month: typeof row.expiry_month === 'number' ? row.expiry_month : null,
      expiry_year: typeof row.expiry_year === 'number' ? row.expiry_year : null,
      cardholder_name: row.cardholder_name ?? null,
      is_default: typeof row.is_default === 'boolean' ? row.is_default : false,
      status: typeof row.status === 'string' && row.status.trim() ? row.status : 'ACTIVE',
      created_at:
        typeof row.created_at === 'string' && row.created_at.trim()
          ? row.created_at
          : new Date(0).toISOString(),
    };
  });
}

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrganizationPaymentCards: build.query<PaymentMethodResponse[], string>({
      query: (organizationId) =>
        `/organizations/${encodeURIComponent(organizationId)}/payment-methods/cards`,
      transformResponse: (raw: unknown) => parseSavedCardsResponse(raw),
      providesTags: ['PaymentMethod'],
    }),
    getBraintreeClientToken: build.query<{ clientToken: string }, string>({
      query: (organizationId) =>
        `/organizations/${encodeURIComponent(organizationId)}/payment-methods/cards/braintree-client-token`,
      transformResponse: (raw: unknown) => parseBraintreeClientToken(raw),
      providesTags: ['PaymentMethod'],
    }),
    saveVaultedPaymentMethod: build.mutation<unknown, SaveOrganizationCardRequest>({
      query: ({ organizationId, nonce, cardholder_name, set_as_default = false }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/payment-methods/cards`,
        method: 'POST',
        body: { nonce, cardholder_name, set_as_default },
      }),
      invalidatesTags: ['PaymentMethod'],
    }),
    markDefaultPaymentMethod: build.mutation<unknown, SetCardDefaultArgs>({
      query: ({ organizationId, cardId }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/payment-methods/cards/${encodeURIComponent(cardId)}/mark-default`,
        method: 'PATCH',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),
    unmarkDefaultPaymentMethod: build.mutation<unknown, SetCardDefaultArgs>({
      query: ({ organizationId, cardId }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/payment-methods/cards/${encodeURIComponent(cardId)}/unmark-default`,
        method: 'PATCH',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),
    deletePaymentMethod: build.mutation<unknown, SetCardDefaultArgs>({
      query: ({ organizationId, cardId }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/payment-methods/cards/${encodeURIComponent(cardId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),
    /**
     * Server-issued payment method nonce for a vaulted card (before charge / 3DS).
     * POST /organizations/:orgId/payment-methods/cards/prepare-payment
     * Body: { card_id }
     */
    requestCardPaymentNonce: build.mutation<
      { nonce: string; bin: string },
      RequestCardPaymentNonceArgs
    >({
      query: ({ organizationId, cardId }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/payment-methods/cards/prepare-payment`,
        method: 'POST',
        body: { card_id: cardId },
      }),
      transformResponse: (raw: unknown) => parseCardPaymentNonce(raw),
    }),
  }),
  overrideExisting: true,
});

export const {
  useDeletePaymentMethodMutation,
  useGetOrganizationPaymentCardsQuery,
  useLazyGetBraintreeClientTokenQuery,
  useMarkDefaultPaymentMethodMutation,
  useRequestCardPaymentNonceMutation,
  useSaveVaultedPaymentMethodMutation,
  useUnmarkDefaultPaymentMethodMutation,
} = paymentsApi;
