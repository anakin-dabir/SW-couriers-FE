import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { extractApiErrorMessageFromBody } from './apiErrorBody';
import type { ApiError } from './types';

/**
 * Type guard to check if error is a FetchBaseQueryError
 */
export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error;
}

/**
 * Type guard to check if error is an error with a message
 */
export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error != null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (isFetchBaseQueryError(error)) {
    if (error.data !== undefined && error.data !== null) {
      if (typeof error.data === 'string') {
        return error.data;
      }
      const extracted = extractApiErrorMessageFromBody(error.data);
      if (extracted) {
        return extracted;
      }
      if (
        typeof error.data === 'object' &&
        'message' in error.data &&
        typeof (error.data as { message: unknown }).message === 'string'
      ) {
        return (error.data as { message: string }).message;
      }
    }
    return `Error ${error.status}: ${error.status || 'Unknown error'}`;
  }

  if (isErrorWithMessage(error)) {
    return error.message;
  }

  return 'An unknown error occurred';
}

/**
 * Format error for API error type
 */
export function formatApiError(error: unknown): ApiError {
  if (isFetchBaseQueryError(error)) {
    return {
      message: getErrorMessage(error),
      status: typeof error.status === 'number' ? error.status : undefined,
      data: error.data,
    };
  }

  return {
    message: getErrorMessage(error),
  };
}
