import { client } from 'braintree-web';
import type { Client } from 'braintree-web';

export function createBraintreeClient(clientToken: string): Promise<Client> {
  return client.create({ authorization: clientToken });
}
