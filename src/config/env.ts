/**
 * Environment variable validation
 *
 * Validates all required environment variables at application startup.
 * Throws an error if any required variable is missing or invalid.
 */

/**
 * Valid environment values
 */
type Environment = 'development' | 'staging' | 'production';

/**
 * Environment variables interface
 */
interface Env {
  /**
   * Base URL for the backend API
   * @example "http://localhost:3000/api" or "https://api.example.com/api"
   */
  VITE_API_BASE_URL: string;

  /**
   * Environment name
   * @example "development", "staging", "production"
   */
  VITE_ENV: Environment;

  /**
   * Application name
   */
  VITE_APP_NAME: string;

  /**
   * Release version (Git tag), injected at build via vite.config / CI.
   * @example "v1.2.0"
   */
  VITE_APP_VERSION: string;

  /**
   * Test email for forgot password flow (development only)
   * @example "abdullah.khan@shiftopus.com"
   */
  VITE_TEST_EMAIL: string;

  /**
   * Test password for forgot password flow (development only)
   * @example "asdASD123!@#"
   */
  VITE_TEST_PASSWORD: string;

  /**
   * OTP code for verification (development only)
   * @example "123456"
   */
  VITE_OTP_CODE: string;

  /**
   * Braintree client token API URL (optional).
   * If not set, uses VITE_API_BASE_URL + "/braintree/client-token".
   * Your server must generate the token via Braintree server SDK.
   */
  VITE_BRAINTREE_CLIENT_TOKEN_URL?: string;

  /**
   * Organization id for org-scoped APIs (e.g. payment methods). Prefer auth context when available.
   */
  VITE_ORGANIZATION_ID: string;
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate environment variable
 */
function validateEnv(): Env {
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api';
  const env = ((import.meta.env.VITE_ENV as string | undefined) || 'development') as Environment;
  const appName = (import.meta.env.VITE_APP_NAME as string | undefined) || 'SW Couriers';
  const appVersion = (import.meta.env.VITE_APP_VERSION as string | undefined)?.trim() || 'dev';
  const testEmail = (import.meta.env.VITE_TEST_EMAIL as string | undefined)?.trim() || '';
  const testPassword = (import.meta.env.VITE_TEST_PASSWORD as string | undefined)?.trim() || '';
  const otpCode = (import.meta.env.VITE_OTP_CODE as string | undefined)?.trim() || '';
  const braintreeClientTokenUrl = (
    import.meta.env.VITE_BRAINTREE_CLIENT_TOKEN_URL as string | undefined
  )?.trim();
  const organizationId = (import.meta.env.VITE_ORGANIZATION_ID as string | undefined)?.trim() || '';

  // Validate environment value
  const validEnvironments: Environment[] = ['development', 'staging', 'production'];
  if (!validEnvironments.includes(env)) {
    console.warn(
      `Invalid VITE_ENV value: ${env}. Expected one of: ${validEnvironments.join(', ')}. Defaulting to 'development'.`
    );
  }

  // Validate API URL (only if it's not a relative path)
  const apiBaseUrlString = String(apiBaseUrl);
  if (
    apiBaseUrlString !== '/api' &&
    !apiBaseUrlString.startsWith('/') &&
    !isValidUrl(apiBaseUrlString)
  ) {
    console.warn(`Invalid VITE_API_BASE_URL format: ${apiBaseUrlString}. Using default '/api'.`);
  }

  // In development without an explicit URL, use relative path so Vite dev server's braintree plugin can respond
  const isDev = validEnvironments.includes(env) ? env === 'development' : true;
  const braintreeUrl =
    braintreeClientTokenUrl ||
    (isDev
      ? '/api/braintree/client-token'
      : apiBaseUrlString.endsWith('/')
        ? `${apiBaseUrlString}braintree/client-token`
        : `${apiBaseUrlString}/braintree/client-token`);

  return {
    VITE_API_BASE_URL: apiBaseUrlString,
    VITE_ENV: validEnvironments.includes(env) ? env : 'development',
    VITE_APP_NAME: String(appName),
    VITE_APP_VERSION: String(appVersion),
    VITE_TEST_EMAIL: String(testEmail),
    VITE_TEST_PASSWORD: String(testPassword),
    VITE_OTP_CODE: String(otpCode),
    VITE_BRAINTREE_CLIENT_TOKEN_URL: braintreeUrl,
    VITE_ORGANIZATION_ID: String(organizationId),
  };
}

/**
 * Validated environment variables
 *
 * Use this object to access environment variables throughout the application.
 * All values are validated and typed.
 *
 * @example
 * ```ts
 * import { env } from '@/config/env';
 * const apiUrl = env.VITE_API_BASE_URL;
 * ```
 */
export const env = validateEnv();

/**
 * Type-safe environment variables
 */
export type { Env };

/**
 * Check if running in development mode
 */
export const isDevelopment = env.VITE_ENV === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = env.VITE_ENV === 'production';

/** Display in UI (sidebar, settings, etc.) — from Git tag at build time. */
export const appVersion = env.VITE_APP_VERSION;
