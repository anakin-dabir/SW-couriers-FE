/**
 * Minimal type declarations for braintree-web used by this project.
 */
declare module 'braintree-web' {
  export interface Client {
    [key: string]: unknown;
  }

  export interface ClientCreateOptions {
    authorization: string;
  }

  export const client: {
    create(options: ClientCreateOptions): Promise<Client>;
  };

  export interface HostedFieldState {
    isValid: boolean;
    isEmpty: boolean;
  }

  export interface HostedFieldsState {
    fields: Record<string, HostedFieldState | undefined>;
  }

  export interface HostedFieldsTokenizePayload {
    nonce: string;
    details?: {
      bin?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }

  export interface HostedFields {
    getState(): HostedFieldsState;
    tokenize(): Promise<HostedFieldsTokenizePayload>;
    teardown(): Promise<void>;
  }

  export interface HostedFieldsCreateOptions {
    client: Client;
    styles?: Record<string, Record<string, string>>;
    fields: Record<
      string,
      {
        selector: string;
        placeholder?: string;
        formatInput?: boolean;
      }
    >;
  }

  export const hostedFields: {
    create(options: HostedFieldsCreateOptions): Promise<HostedFields>;
  };

  export interface ThreeDSecureLookupNext {
    (): void;
  }

  export interface ThreeDSecure {
    on(
      event: 'lookup-complete',
      callback: (data: unknown, next: ThreeDSecureLookupNext) => void
    ): void;
    verifyCard(options: {
      nonce: string;
      bin: string;
      amount: string;
      billingAddress?: { givenName: string; surname: string };
    }): Promise<{ nonce: string; [key: string]: unknown }>;
    teardown(): Promise<void>;
  }

  export const threeDSecure: {
    create(options: { client: Client; version: 2 | 1 }): Promise<ThreeDSecure>;
  };
}
