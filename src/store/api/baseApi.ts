import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import type { RootState } from '@/store/store';
import { env } from '@/config/env';
import { updateAccessToken, clearCredentials } from '@/store/slices/authSlice';

interface AuthTokens {
  access_token: string;
  access_token_expires_in: number;
}

/** Matches login/refresh API: `{ success, tokens }` at top level */
interface SessionRefreshResponse {
  success?: boolean;
  message?: string;
  tokens?: AuthTokens;
}

const AUTH_PATHS_SKIP_REFRESH = [
  '/auth/login',
  '/auth/session/refresh',
  '/auth/request-password-reset',
  '/auth/confirm-password-reset',
  '/auth/verify-password-reset-otp',
  '/auth/invites/validate',
  '/auth/invites/activate',
] as const;

// Serialize array params as repeated keys: ?a=1&a=2 instead of ?a=1,2
const serializeParams = (params: Record<string, unknown>): string => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((v: unknown) => qs.append(key, String(v)));
    } else if (typeof value !== 'object') {
      qs.set(key, String(value as string | number | boolean));
    }
  }
  return qs.toString();
};

const baseQuery = fetchBaseQuery({
  baseUrl: env.VITE_API_BASE_URL + '/api/v1',
  credentials: 'include',
  paramsSerializer: serializeParams,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    headers.set('Accept', 'application/json');
    headers.set('x-client-type', 'CUSTOMER_B2B');

    return headers;
  },
});

function getRequestUrl(args: string | FetchArgs): string {
  return typeof args === 'string' ? args : args.url;
}

function shouldSkipTokenRefresh(args: string | FetchArgs): boolean {
  const url = getRequestUrl(args);
  return AUTH_PATHS_SKIP_REFRESH.some((path) => url === path || url.startsWith(`${path}?`));
}

function parseRefreshTokens(data: unknown): AuthTokens | null {
  if (!data || typeof data !== 'object') return null;

  const response = data as SessionRefreshResponse;
  const tokens = response.tokens;

  if (tokens && typeof tokens.access_token === 'string' && tokens.access_token.length > 0) {
    return tokens;
  }

  return null;
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(
  api: BaseQueryApi,
  extraOptions: Record<string, unknown>
): Promise<boolean> {
  const refreshResult = await baseQuery(
    { url: '/auth/session/refresh', method: 'POST' },
    api,
    extraOptions
  );

  const tokens = parseRefreshTokens(refreshResult.data);
  if (!tokens) {
    return false;
  }

  api.dispatch(updateAccessToken({ accessToken: tokens.access_token, tokens }));
  return true;
}

// Custom base query with token refresh on 401
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && !shouldSkipTokenRefresh(args)) {
    if (!refreshPromise) {
      refreshPromise = refreshSession(api, extraOptions).finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;

    if (refreshed) {
      result = await baseQuery(args, api, extraOptions);
    } else {
      const state = api.getState() as RootState;
      if (state.auth?.isAuthenticated) {
        api.dispatch(clearCredentials());
      }
    }
  }

  return result;
};

// Create the base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    // Add your tag types here for cache invalidation
    'Todo', // Todo tag for JSONPlaceholder API
    'NotificationPreference',
    'NotificationInbox',
    'UnreadNotificationCount',
    'PaymentMethod',
    'OrganizationProfile',
    'OrganizationProfileCompletion',
    'OrganizationDetails',
    'OrganizationPaymentDetails',
    'AuditLogsSummary',
    'AuditLogsTrend',
    'AuditLogsList',
    'AuditSavedViews',
    'DataAccessLogs',
    'ChangeHistoryLogs',
    'FieldHistory',
    'OrgContacts',
    'CreditCurrentApplication',
    'CreditApplication',
    'CreditDrafts',
    'CreditDraftDetail',
    'BillingRefundList',
    'BillingRefundKpis',
    'BillingRefundDetail',
    'BillingCreditNoteList',
    'BillingCreditNoteDetail',
    'BillingCreditNoteCandidates',
    'BillingCreditNotePdfStatus',
    'BillingInvoiceList',
    'BillingInvoiceSummary',
    'BillingInvoiceDetail',
    'BillingInvoicePayments',
    'BillingInvoicePdfStatus',
    'BillingPaymentHistory',
    'BillingPaymentKpis',
    'BillingPaymentDetail',
    'AccountStatementList',
    'AccountStatementDetail',
    'AccountStatementPdfStatus',
    'OrdersList',
    'OrdersSummary',
    'OrderDetail',
    'OrderFailedDeliveriesSummary',
    'OrderFailedDeliveriesList',
    'OrderReturnsList',
    'OrderReturnsSummary',
    'OrderDraftsList',
    'OrderDraftDetail',
    'CreditOverview',
    'CreditLimitTrend',
    'CreditUtilisationTrend',
    'CreditActivity',
    'CreditLimitIncreaseRequests',
    'CreditLimitIncreaseRequestDetail',
    'ServiceTier',
    // Example: 'User', 'Post', 'Order', 'Courier', 'Shipment', etc.
  ],
  endpoints: () => ({}),
  // Global configuration — false avoids refetching cached data on every route remount; use
  // per-hook `{ refetchOnMountOrArgChange: true }` or `.refetch()` where freshness matters.
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: true,
});
