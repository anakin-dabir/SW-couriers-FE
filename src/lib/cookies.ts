import Cookies from 'js-cookie';
import type { AuthUser } from '@/types/auth';

/**
 * Cookie utility functions for authentication
 *
 * Provides a centralized way to manage authentication cookies
 * with consistent naming and expiration settings.
 */

const COOKIE_OPTIONS = {
  // Cookie expires in 7 days
  expires: 7,
  // Secure cookies (HTTPS only) - set to true in production
  secure: process.env.NODE_ENV === 'production',
  // SameSite attribute for CSRF protection
  sameSite: 'strict' as const,
  // Path for cookie
  path: '/',
} as const;

const SESSION_COOKIE_OPTIONS = {
  // Session cookie (expires when browser closes)
  expires: undefined,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
} as const;

/**
 * Cookie keys
 */
export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  USER: 'user',
  PENDING_AUTH: 'pendingAuth',
} as const;

/**
 * Set access token cookie
 */
export const setAccessToken = (token: string): void => {
  Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, token, COOKIE_OPTIONS);
};

/**
 * Get access token from cookie
 */
export const getAccessToken = (): string | undefined => {
  return Cookies.get(COOKIE_KEYS.ACCESS_TOKEN);
};

/**
 * Remove access token cookie
 */
export const removeAccessToken = (): void => {
  Cookies.remove(COOKIE_KEYS.ACCESS_TOKEN, { path: '/' });
};

/**
 * Set user data cookie
 */
export const setUser = (user: AuthUser): void => {
  Cookies.set(COOKIE_KEYS.USER, JSON.stringify(user), COOKIE_OPTIONS);
};

/**
 * Get user data from cookie
 */
export const getUser = (): AuthUser | null => {
  const userStr = Cookies.get(COOKIE_KEYS.USER);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
};

/**
 * Remove user cookie
 */
export const removeUser = (): void => {
  Cookies.remove(COOKIE_KEYS.USER, { path: '/' });
};

/**
 * Set pending auth data (session cookie - expires when browser closes)
 * Used for temporary storage during OTP verification flow
 */
export const setPendingAuth = (data: { accessToken: string; user: AuthUser }): void => {
  Cookies.set(COOKIE_KEYS.PENDING_AUTH, JSON.stringify(data), SESSION_COOKIE_OPTIONS);
};

/**
 * Get pending auth data from cookie
 */
export const getPendingAuth = (): {
  accessToken: string;
  user: AuthUser;
} | null => {
  const pendingAuthStr = Cookies.get(COOKIE_KEYS.PENDING_AUTH);
  if (!pendingAuthStr) return null;
  try {
    return JSON.parse(pendingAuthStr) as {
      accessToken: string;
      user: AuthUser;
    };
  } catch {
    return null;
  }
};

/**
 * Remove pending auth cookie
 */
export const removePendingAuth = (): void => {
  Cookies.remove(COOKIE_KEYS.PENDING_AUTH, { path: '/' });
};

/**
 * Clear all authentication cookies
 */
export const clearAuthCookies = (): void => {
  removeAccessToken();
  removeUser();
  removePendingAuth();
};
