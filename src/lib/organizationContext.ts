import { useMemo } from 'react';
import { env } from '@/config/env';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

export function parseOrganizationIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length < 2) return null;
    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payloadJson = window.atob(paddedBase64);
    const payload = JSON.parse(payloadJson) as {
      org_id?: string;
      organization_id?: string;
    };
    const raw = payload.organization_id ?? payload.org_id;
    return typeof raw === 'string' && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

/** Resolves B2B organization id from auth, JWT, or env fallback (dev). */
export function useOrganizationId(): string | null {
  const organizationIdFromUser = useAppSelector(
    (state: RootState) =>
      state.auth.user?.organization_id ??
      state.auth.loginResponse?.data?.organization_id ??
      state.auth.loginResponse?.data?.organization?.id ??
      null
  );
  const accessToken = useAppSelector((state: RootState) => state.auth.accessToken);
  const organizationIdFromEnv =
    env.VITE_ORGANIZATION_ID.length > 0 ? env.VITE_ORGANIZATION_ID : null;

  return useMemo(
    () =>
      organizationIdFromUser ?? parseOrganizationIdFromToken(accessToken) ?? organizationIdFromEnv,
    [organizationIdFromUser, accessToken, organizationIdFromEnv]
  );
}
