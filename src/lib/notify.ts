import type { ToasterProps } from 'sonner';
import { toast, type ExternalToast } from 'sonner';
import { getErrorMessage, isFetchBaseQueryError } from '@/store/api/utils';

type ToastPosition = NonNullable<ToasterProps['position']>;

const DEFAULT_POSITION: ToastPosition = 'top-right';
const DEFAULT_SUCCESS_MESSAGE = 'Request completed successfully';
const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

interface NotifyOptions extends ExternalToast {
  position?: ToastPosition;
}

interface ApiMessageLike {
  message?: unknown;
}

function withDefaults(options?: NotifyOptions): ExternalToast {
  return {
    position: DEFAULT_POSITION,
    ...options,
  };
}

function getApiMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const candidate = payload as ApiMessageLike;
  return typeof candidate.message === 'string' ? candidate.message : undefined;
}

function getApiErrorMessageFromResponse(error: unknown): string | undefined {
  if (!isFetchBaseQueryError(error) || error.data == null || typeof error.data !== 'object') {
    return undefined;
  }
  const message = (error.data as ApiMessageLike).message;
  return typeof message === 'string' && message.trim().length > 0 ? message.trim() : undefined;
}

export const notify = {
  success: (message: string, options?: NotifyOptions) =>
    toast.success(message, withDefaults(options)),
  error: (message: string, options?: NotifyOptions) => toast.error(message, withDefaults(options)),
  info: (message: string, options?: NotifyOptions) => toast.info(message, withDefaults(options)),
  warning: (message: string, options?: NotifyOptions) =>
    toast.warning(message, withDefaults(options)),
};

export function notifyApiSuccess(
  payload?: unknown,
  options?: NotifyOptions & { message?: string }
): string | number {
  const message = options?.message ?? getApiMessage(payload) ?? DEFAULT_SUCCESS_MESSAGE;
  return toast.success(message, withDefaults(options));
}

export function notifyApiError(
  error: unknown,
  options?: NotifyOptions & { message?: string }
): string | number {
  const apiMessage = getApiErrorMessageFromResponse(error);
  const message = apiMessage ?? options?.message ?? getErrorMessage(error) ?? DEFAULT_ERROR_MESSAGE;
  return toast.error(message, withDefaults(options));
}
