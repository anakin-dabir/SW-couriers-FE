/**
 * Minimal type declarations for braintree-web-drop-in
 * @see https://developer.paypal.com/braintree/docs/start/drop-in/
 */

declare module 'braintree-web-drop-in' {
  export interface HostedFieldsStyles {
    input?: Record<string, string>;
    'input:focus'?: Record<string, string>;
    ':focus'?: Record<string, string>;
    '.invalid'?: Record<string, string>;
    '.valid'?: Record<string, string>;
    [selector: string]: Record<string, string> | undefined;
  }

  export interface DropinCreateOptions {
    authorization: string;
    container: string | HTMLElement;
    locale?: string;
    card?:
      | boolean
      | {
          cardholderName?: boolean | { required?: boolean };
          overrides?: {
            styles?: HostedFieldsStyles;
            fields?: Record<string, unknown>;
          };
        };
    paypal?: { flow: string; amount?: string; currency?: string };
    [key: string]: unknown;
  }

  export interface RequestPaymentMethodPayload {
    nonce: string;
    type: string;
    details?: Record<string, unknown>;
    description?: string;
    deviceData?: string;
    [key: string]: unknown;
  }

  export interface DropinInstance {
    requestPaymentMethod(options?: unknown): Promise<RequestPaymentMethodPayload>;
    teardown(): Promise<void>;
    on(event: string, callback: (...args: unknown[]) => void): void;
    [key: string]: unknown;
  }

  export function create(options: DropinCreateOptions): Promise<DropinInstance>;

  export const VERSION: string;
}
