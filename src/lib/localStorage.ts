/**
 * LocalStorage utility functions for authentication and test credentials
 *
 * Provides a centralized way to manage authentication data and test credentials
 * stored in localStorage with consistent naming.
 */

/**
 * LocalStorage keys
 */
export const STORAGE_KEYS = {
  TEST_EMAIL: 'obaid.tariq@shiftopus.com',
  TEST_PASSWORD: 'Password@123',
  OTP_CODE: '123456',
  PENDING_AUTH: 'pending_auth',
  ACCESS_TOKEN: 'access_token',
  USER: 'user',
} as const;

/**
 * Test Credentials Management
 */

/**
 * Set test email in localStorage
 */
export const setTestEmail = (email: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEST_EMAIL, email.trim());
  } catch (error) {
    console.error('Failed to set test email:', error);
  }
};

/**
 * Get test email from localStorage
 */
export const getTestEmail = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TEST_EMAIL) || '';
  } catch (error) {
    console.error('Failed to get test email:', error);
    return '';
  }
};

/**
 * Set test password in localStorage
 */
export const setTestPassword = (password: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEST_PASSWORD, password.trim());
  } catch (error) {
    console.error('Failed to set test password:', error);
  }
};

/**
 * Get test password from localStorage
 */
export const getTestPassword = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TEST_PASSWORD) || '';
  } catch (error) {
    console.error('Failed to get test password:', error);
    return '';
  }
};

/**
 * Set OTP code in localStorage
 */
export const setOTPCode = (code: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.OTP_CODE, code.trim());
  } catch (error) {
    console.error('Failed to set OTP code:', error);
  }
};

/**
 * Get OTP code from localStorage
 */
export const getOTPCode = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.OTP_CODE) || '';
  } catch (error) {
    console.error('Failed to get OTP code:', error);
    return '';
  }
};

/**
 * Pending Auth Management (for OTP flow)
 */

/**
 * Set pending auth data in localStorage
 * Used for temporary storage during OTP verification flow
 */
export const setPendingAuth = (data: {
  accessToken: string;
  user: { id: string; email: string; name: string };
}): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PENDING_AUTH, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to set pending auth:', error);
  }
};

/**
 * Get pending auth data from localStorage
 */
export const getPendingAuth = (): {
  accessToken: string;
  user: { id: string; email: string; name: string };
} | null => {
  try {
    const pendingAuthStr = localStorage.getItem(STORAGE_KEYS.PENDING_AUTH);
    if (!pendingAuthStr) return null;
    return JSON.parse(pendingAuthStr) as {
      accessToken: string;
      user: { id: string; email: string; name: string };
    };
  } catch (error) {
    console.error('Failed to get pending auth:', error);
    return null;
  }
};

/**
 * Remove pending auth from localStorage
 */
export const removePendingAuth = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PENDING_AUTH);
  } catch (error) {
    console.error('Failed to remove pending auth:', error);
  }
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PENDING_AUTH);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Failed to clear auth storage:', error);
  }
};
