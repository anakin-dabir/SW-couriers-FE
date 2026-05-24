import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface ApiValidationErrorDetail {
  field: string;
  message: string;
  type?: string;
}

/** Normalized client-side validation / 422-style payload (field-level optional). */
export interface ParsedApiValidationError {
  success: false;
  message: string;
  code: string;
  details: ApiValidationErrorDetail[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Strip common API prefixes so mappers can match stable keys.
 */
export function normalizeApiValidationField(field: string): string {
  let f = field.trim();
  if (f.startsWith('payload.')) {
    f = f.slice('payload.'.length);
  }
  if (f.startsWith('body.')) {
    f = f.slice('body.'.length);
  }
  return f;
}

function joinLocationPath(loc: unknown[]): string {
  const parts: string[] = [];
  for (const segment of loc) {
    if (typeof segment === 'string' || typeof segment === 'number') {
      parts.push(String(segment));
    }
  }
  const drop = new Set(['body', 'query', 'path', 'header', 'json', 'form', 'cookie']);
  let i = 0;
  while (i < parts.length && drop.has(parts[i])) {
    i += 1;
  }
  return parts.slice(i).join('.');
}

function mapItemToValidationDetail(item: Record<string, unknown>): ApiValidationErrorDetail | null {
  const message =
    typeof item.message === 'string'
      ? item.message
      : typeof item.msg === 'string'
        ? item.msg
        : typeof item.error === 'string'
          ? item.error
          : null;
  if (!message) {
    return null;
  }

  let field: string | null = null;
  if (typeof item.field === 'string') {
    field = item.field;
  } else if (typeof item.path === 'string') {
    field = item.path;
  } else if (typeof item.name === 'string') {
    field = item.name;
  } else if (typeof item.key === 'string') {
    field = item.key;
  } else if (Array.isArray(item.loc)) {
    const joined = joinLocationPath(item.loc);
    field = joined.length > 0 ? joined : '__root';
  }

  if (!field) {
    field = '__root';
  }

  return {
    field: normalizeApiValidationField(field),
    message,
    type: typeof item.type === 'string' ? item.type : undefined,
  };
}

function parseDetailsArray(raw: unknown[]): ApiValidationErrorDetail[] {
  const details: ApiValidationErrorDetail[] = [];
  for (const item of raw) {
    if (!isRecord(item)) {
      continue;
    }
    const mapped = mapItemToValidationDetail(item);
    if (mapped) {
      details.push(mapped);
    }
  }
  return details;
}

/**
 * User-facing summary from API `details` (each item has server `field` + `message`).
 * Used for toasts when the top-level `message` is a generic label like "Validation error".
 */
export function summarizeValidationDetailMessages(
  details: ApiValidationErrorDetail[]
): string | null {
  if (details.length === 0) {
    return null;
  }
  if (details.length === 1) {
    return details[0].message;
  }
  return details.map((d) => d.message).join(' · ');
}

function withDetailBackedSummary(parsed: ParsedApiValidationError): ParsedApiValidationError {
  const summary = summarizeValidationDetailMessages(parsed.details);
  if (summary !== null) {
    return { ...parsed, message: summary };
  }
  return parsed;
}

/** `{ success: false, message, error: { code, details } }` (Shiftopus-style). */
function parseShiftopusEnvelope(data: Record<string, unknown>): ParsedApiValidationError | null {
  if (data.success !== false) {
    return null;
  }
  const message = typeof data.message === 'string' ? data.message : 'Validation error';
  const errBlock = data.error;
  if (!isRecord(errBlock)) {
    return { success: false, message, code: 'VALIDATION_ERROR', details: [] };
  }
  const code = typeof errBlock.code === 'string' ? errBlock.code : 'VALIDATION_ERROR';
  const rawDetails = errBlock.details;
  const details = Array.isArray(rawDetails) ? parseDetailsArray(rawDetails) : [];
  return { success: false, message, code, details };
}

/** NestJS class-validator style: `{ message: string[], error?: string }`. */
function parseNestArrayMessage(data: Record<string, unknown>): ParsedApiValidationError | null {
  const msg = data.message;
  if (!Array.isArray(msg) || msg.length === 0) {
    return null;
  }
  if (!msg.every((m): m is string => typeof m === 'string')) {
    return null;
  }
  const details: ApiValidationErrorDetail[] = msg.map((m, i) => ({
    field: `__root.${i}`,
    message: m,
  }));
  const headline =
    typeof data.error === 'string' && data.error.length > 0 ? data.error : 'Validation error';
  return {
    success: false,
    message: msg.join(' ').length > 0 ? msg.join(' ') : headline,
    code: 'VALIDATION_ERROR',
    details,
  };
}

/** FastAPI / Starlette: `{ detail: string | { loc, msg, type? }[] }`. */
function parseFastApiDetail(data: Record<string, unknown>): ParsedApiValidationError | null {
  if (!('detail' in data)) {
    return null;
  }
  const detail = data.detail;
  if (typeof detail === 'string') {
    const message =
      typeof data.message === 'string' && data.message.length > 0 ? data.message : detail;
    return { success: false, message, code: 'VALIDATION_ERROR', details: [] };
  }
  if (!Array.isArray(detail)) {
    return null;
  }
  const details = parseDetailsArray(detail);
  const message =
    typeof data.message === 'string' && data.message.length > 0
      ? data.message
      : (details[0]?.message ?? 'Validation error');
  if (details.length === 0) {
    return null;
  }
  return { success: false, message, code: 'VALIDATION_ERROR', details };
}

function flattenErrorsRecord(
  errors: Record<string, unknown>,
  prefix = ''
): ApiValidationErrorDetail[] {
  const out: ApiValidationErrorDetail[] = [];
  for (const [key, value] of Object.entries(errors)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      out.push({ field: normalizeApiValidationField(path), message: value });
    } else if (Array.isArray(value)) {
      const strings = value.filter((v): v is string => typeof v === 'string');
      if (strings.length > 0) {
        out.push({
          field: normalizeApiValidationField(path),
          message: strings.join('; '),
        });
      }
    } else if (isRecord(value)) {
      out.push(...flattenErrorsRecord(value, path));
    }
  }
  return out;
}

/** Laravel / Rails-like `{ errors: { field: string | string[] } }`. */
function parseErrorsRecord(data: Record<string, unknown>): ParsedApiValidationError | null {
  if (!isRecord(data.errors)) {
    return null;
  }
  const details = flattenErrorsRecord(data.errors);
  if (details.length === 0) {
    return null;
  }
  const message = typeof data.message === 'string' ? data.message : 'Validation error';
  return { success: false, message, code: 'VALIDATION_ERROR', details };
}

/** RFC 7807-style `invalid-params`: `[{ name, reason }]` */
function parseInvalidParamsRFC7807(data: Record<string, unknown>): ParsedApiValidationError | null {
  const invalid = data['invalid-params'] ?? data.invalid_params;
  if (!Array.isArray(invalid)) {
    return null;
  }
  const details: ApiValidationErrorDetail[] = [];
  for (const item of invalid) {
    if (!isRecord(item)) {
      continue;
    }
    const name =
      typeof item.name === 'string'
        ? item.name
        : typeof item.field === 'string'
          ? item.field
          : null;
    const reason =
      typeof item.reason === 'string'
        ? item.reason
        : typeof item.message === 'string'
          ? item.message
          : null;
    if (name && reason) {
      details.push({ field: normalizeApiValidationField(name), message: reason });
    }
  }
  if (details.length === 0) {
    return null;
  }
  const detailStr = typeof data.detail === 'string' ? data.detail : 'Validation error';
  return { success: false, message: detailStr, code: 'VALIDATION_ERROR', details };
}

/** Top-level `{ details: [...] }` without `success: false`. */
function parseTopLevelDetailsArray(data: Record<string, unknown>): ParsedApiValidationError | null {
  if (data.success === false) {
    return null;
  }
  if (!Array.isArray(data.details)) {
    return null;
  }
  const details = parseDetailsArray(data.details);
  if (details.length === 0) {
    return null;
  }
  const message = typeof data.message === 'string' ? data.message : 'Validation error';
  return { success: false, message, code: 'VALIDATION_ERROR', details };
}

/** Nested `{ error: { details: [...] } }` without full Shiftopus envelope. */
function parseNestedErrorDetails(data: Record<string, unknown>): ParsedApiValidationError | null {
  const err = data.error;
  if (!isRecord(err) || !Array.isArray(err.details)) {
    return null;
  }
  const details = parseDetailsArray(err.details);
  if (details.length === 0) {
    return null;
  }
  const message = typeof data.message === 'string' ? data.message : 'Validation error';
  const code = typeof err.code === 'string' ? err.code : 'VALIDATION_ERROR';
  return { success: false, message, code, details };
}

/** Zod-style `{ issues: [{ path, message }] }` (some gateways expose this). */
function parseZodIssues(data: Record<string, unknown>): ParsedApiValidationError | null {
  if (!Array.isArray(data.issues)) {
    return null;
  }
  const details: ApiValidationErrorDetail[] = [];
  for (const item of data.issues) {
    if (!isRecord(item)) {
      continue;
    }
    const message =
      typeof item.message === 'string'
        ? item.message
        : typeof item.msg === 'string'
          ? item.msg
          : null;
    if (!message) {
      continue;
    }
    const pathArr = item.path;
    let field = '__root';
    if (Array.isArray(pathArr) && pathArr.length > 0) {
      field = pathArr.map(String).join('.');
    }
    details.push({ field: normalizeApiValidationField(field), message });
  }
  if (details.length === 0) {
    return null;
  }
  return {
    success: false,
    message: typeof data.message === 'string' ? data.message : 'Validation error',
    code: 'VALIDATION_ERROR',
    details,
  };
}

const validationBodyParsers: Array<
  (data: Record<string, unknown>) => ParsedApiValidationError | null
> = [
  parseShiftopusEnvelope,
  parseNestArrayMessage,
  parseFastApiDetail,
  parseErrorsRecord,
  parseInvalidParamsRFC7807,
  parseTopLevelDetailsArray,
  parseNestedErrorDetails,
  parseZodIssues,
];

/**
 * Parse JSON error bodies from common API frameworks into a single shape.
 * Does not inspect HTTP status; use {@link parseClientValidationFromFetchError} for RTK errors.
 */
export function parseValidationErrorBody(data: unknown): ParsedApiValidationError | null {
  if (data === null || data === undefined) {
    return null;
  }
  if (typeof data === 'string') {
    return { success: false, message: data, code: 'VALIDATION_ERROR', details: [] };
  }
  if (!isRecord(data)) {
    return null;
  }
  for (const parse of validationBodyParsers) {
    const result = parse(data);
    if (result) {
      return withDetailBackedSummary(result);
    }
  }
  return null;
}

/**
 * Best-effort user-facing string for any JSON (or string) API error `data`.
 * Avoids depending on a single backend envelope.
 */
export function extractApiErrorMessageFromBody(data: unknown): string | null {
  if (typeof data === 'string' && data.trim().length > 0) {
    return data;
  }
  if (!isRecord(data)) {
    return null;
  }
  // Prefer per-field messages over generic top-level `message` (e.g. Shiftopus validation).
  if (isRecord(data.error) && Array.isArray(data.error.details)) {
    const nested = summarizeValidationDetailMessages(parseDetailsArray(data.error.details));
    if (nested) {
      return nested;
    }
  }
  if (Array.isArray(data.details)) {
    const top = summarizeValidationDetailMessages(parseDetailsArray(data.details));
    if (top) {
      return top;
    }
  }
  if (typeof data.message === 'string' && data.message.length > 0 && !Array.isArray(data.message)) {
    return data.message;
  }
  if (
    Array.isArray(data.message) &&
    data.message.every((m): m is string => typeof m === 'string')
  ) {
    return data.message.join('. ');
  }
  if (typeof data.detail === 'string' && data.detail.length > 0) {
    return data.detail;
  }
  if (typeof data.title === 'string') {
    const d = typeof data.detail === 'string' ? data.detail : '';
    return d.length > 0 ? `${data.title}: ${d}` : data.title;
  }
  if (typeof data.error === 'string' && data.error.length > 0) {
    return data.error;
  }
  if (isRecord(data.error) && typeof data.error.message === 'string') {
    return data.error.message;
  }
  return null;
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

/**
 * Parse validation-style responses for typical client errors (422 always; 400 when field details exist).
 */
export function parseClientValidationFromFetchError(
  error: unknown
): ParsedApiValidationError | null {
  if (!isFetchBaseQueryError(error)) {
    return null;
  }
  const status = error.status;
  if (typeof status !== 'number') {
    return null;
  }
  if (status !== 400 && status !== 422) {
    return null;
  }
  const parsed = parseValidationErrorBody(error.data);
  if (!parsed) {
    return null;
  }
  if (status === 422) {
    return parsed;
  }
  if (parsed.details.length > 0) {
    return parsed;
  }
  return null;
}
