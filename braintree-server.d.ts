/**
 * Type declaration for braintree (Node.js server SDK)
 * @see https://developer.paypal.com/braintree/docs/start/hello-server/node
 */
declare module 'braintree' {
  export interface BraintreeGatewayConfig {
    environment: unknown;
    merchantId: string;
    publicKey: string;
    privateKey: string;
  }

  export class BraintreeGateway {
    constructor(config: BraintreeGatewayConfig);
    clientToken: { generate(params?: object): Promise<{ clientToken: string }> };
  }

  export const Environment: {
    Sandbox: unknown;
    Production: unknown;
  };
}
