import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import type { ParsedApiValidationError } from './apiErrorBody';
import { parseValidationErrorBody } from './apiErrorBody';
import { isFetchBaseQueryError } from './utils';

export type { ApiValidationErrorDetail, ParsedApiValidationError } from './apiErrorBody';
export {
  extractApiErrorMessageFromBody,
  normalizeApiValidationField,
  parseClientValidationFromFetchError,
  parseValidationErrorBody,
  summarizeValidationDetailMessages,
} from './apiErrorBody';

/**
 * True when RTK Query / fetch failed with HTTP 422.
 */
export function isApiValidation422(error: unknown): error is FetchBaseQueryError {
  return isFetchBaseQueryError(error) && error.status === 422;
}

/**
 * Parse a validation-shaped JSON body (any supported framework shape).
 * @deprecated Prefer {@link parseValidationErrorBody}; kept for call sites that only have `data`.
 */
export function parseApiValidation422Body(data: unknown): ParsedApiValidationError | null {
  return parseValidationErrorBody(data);
}

/**
 * Parse 422 response body from an RTK `unwrap()` rejection.
 * Only runs for HTTP 422; for 400+422 use {@link parseClientValidationFromFetchError}.
 */
export function parseApiValidation422FromFetchError(
  error: unknown
): ParsedApiValidationError | null {
  if (!isApiValidation422(error)) {
    return null;
  }
  return parseValidationErrorBody(error.data);
}
